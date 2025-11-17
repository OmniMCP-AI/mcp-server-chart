import { z } from "zod";
import * as Charts from "../charts";
import { generateChartUrl, generateMap, generateStockChart } from "./generate";
import { ValidateError } from "./validator";

// Chart type mapping
const CHART_TYPE_MAP = {
  generate_area_chart: "area",
  generate_bar_chart: "bar",
  generate_boxplot_chart: "boxplot",
  generate_candlestick_chart: "candlestick",
  generate_column_chart: "column",
  generate_district_map: "district-map",
  generate_dual_axes_chart: "dual-axes",
  generate_fishbone_diagram: "fishbone-diagram",
  generate_flow_diagram: "flow-diagram",
  generate_funnel_chart: "funnel",
  generate_histogram_chart: "histogram",
  generate_line_chart: "line",
  generate_liquid_chart: "liquid",
  generate_mind_map: "mind-map",
  generate_network_graph: "network-graph",
  generate_organization_chart: "organization-chart",
  generate_path_map: "path-map",
  generate_pie_chart: "pie",
  generate_pin_map: "pin-map",
  generate_radar_chart: "radar",
  generate_sankey_chart: "sankey",
  generate_scatter_chart: "scatter",
  generate_treemap_chart: "treemap",
  generate_venn_chart: "venn",
  generate_violin_chart: "violin",
  generate_word_cloud_chart: "word-cloud",
} as const;

/**
 * Call a tool to generate a chart based on the provided name and arguments.
 * @param tool The name of the tool to call, e.g., "generate_area_chart" or "generate_chart".
 * @param args The arguments for the tool, which should match the expected schema for the chart type.
 * @returns
 */
export async function callTool(tool: string, args: object = {}) {
  // Handle unified chart tool
  if (tool === "generate_chart") {
    const { type, ...restArgs } = args as { type?: string; [key: string]: unknown };

    if (!type) {
      // Return error according to MCP protocol with isError: true
      return {
        content: [
          {
            type: "text",
            text: "The 'type' parameter is required for generate_chart tool.",
          },
        ],
        isError: true,
      };
    }

    // Validate that the type is supported
    if (!Object.values(CHART_TYPE_MAP).includes(type as any)) {
      // Return error according to MCP protocol with isError: true
      return {
        content: [
          {
            type: "text",
            text: `Unsupported chart type: ${type}. Supported types: ${Object.values(CHART_TYPE_MAP).join(", ")}`,
          },
        ],
        isError: true,
      };
    }

    // Use the type as chartType and continue with normal processing
    const chartType = type;
    return await generateChart(chartType, restArgs, tool);
  }

  // Handle individual chart tools
  const chartType = CHART_TYPE_MAP[tool as keyof typeof CHART_TYPE_MAP];

  if (!chartType) {
    // Return error according to MCP protocol with isError: true
    return {
      content: [
        {
          type: "text",
          text: `Unknown tool: ${tool}.`,
        },
      ],
      isError: true,
    };
  }

  return await generateChart(chartType, args, tool);
}

/**
 * Generate a chart with the given type and arguments.
 * @param chartType The chart type (e.g., "line", "bar", "pie")
 * @param args The chart configuration arguments
 * @param originalTool The original tool name (for map chart detection)
 * @returns
 */
async function generateChart(chartType: string, args: object, originalTool: string) {
  try {
    // Validate input using Zod before sending to API.
    // Select the appropriate schema based on the chart type.
    const schema = (Charts as Record<string, any>)[chartType]?.schema;

    if (schema) {
      // Use safeParse instead of parse and try-catch.
      const result = z.object(schema).safeParse(args);
      if (!result.success) {
        // Return error according to MCP protocol with isError: true
        return {
          content: [
            {
              type: "text",
              text: `Invalid parameters: ${result.error.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    // Check if this is a stock chart (candlestick)
    const isStockChart = chartType === "candlestick" ||
                         originalTool === "generate_candlestick_chart";

    if (isStockChart) {
      // For stock charts, use local SSR rendering and upload to file service
      const url = await generateStockChart(args);
      return {
        content: [
          {
            type: "text",
            text: url,
          },
        ],
        _meta: {
          description: "Stock chart (candlestick) rendered locally using ECharts and uploaded to file service",
          spec: { type: chartType, ...args },
        },
      };
    }

    const isMapChartTool = [
      "generate_district_map",
      "generate_path_map",
      "generate_pin_map",
    ].includes(originalTool) || [
      "district-map",
      "path-map",
      "pin-map",
    ].includes(chartType);

    if (isMapChartTool) {
      // For map charts, we use the generateMap function, and return the mcp result.
      // Convert chart type to tool name for map generation
      const mapToolName = originalTool === "generate_chart"
        ? `generate_${chartType.replace("-", "_")}`
        : originalTool;
      const { metadata, ...result } = await generateMap(mapToolName, args);
      return result;
    }

    const url = await generateChartUrl(chartType, args);

    return {
      content: [
        {
          type: "text",
          text: url,
        },
      ],
      _meta: {
        description:
          "Charts spec configuration, you can use this config to generate the corresponding chart.",
        spec: { type: chartType, ...args },
      },
    };
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    // Return error according to MCP protocol with isError: true
    let errorMessage = "Unknown error.";

    if (error instanceof ValidateError) {
      errorMessage = error.message;
    } else if (error?.message) {
      errorMessage = `Failed to generate chart: ${error.message}`;
    }

    return {
      content: [
        {
          type: "text",
          text: errorMessage,
        },
      ],
      isError: true,
    };
  }
}
