import { z } from "zod";
import { zodToJsonSchema } from "../utils";

/**
 * Unified chart generation tool that supports all chart types.
 * This tool allows generating any supported chart by specifying the type parameter.
 */

// Define all supported chart types
const ChartTypeEnum = z.enum([
  "area",
  "bar",
  "boxplot",
  "column",
  "district-map",
  "dual-axes",
  "fishbone-diagram",
  "flow-diagram",
  "funnel",
  "histogram",
  "line",
  "liquid",
  "mind-map",
  "network-graph",
  "organization-chart",
  "path-map",
  "pie",
  "pin-map",
  "radar",
  "sankey",
  "scatter",
  "treemap",
  "venn",
  "violin",
  "word-cloud",
]);

// Unified chart input schema
const schema = {
  type: ChartTypeEnum.describe(
    "The type of chart to generate. Supported types: " +
    "area (area chart for trends), " +
    "bar (horizontal bar chart), " +
    "boxplot (box plot for data distribution), " +
    "column (vertical column chart), " +
    "district-map (administrative district map), " +
    "dual-axes (dual-axis chart), " +
    "fishbone-diagram (fishbone/Ishikawa diagram), " +
    "flow-diagram (flowchart), " +
    "funnel (funnel chart), " +
    "histogram (histogram for distribution), " +
    "line (line chart for trends over time), " +
    "liquid (liquid/water fill chart), " +
    "mind-map (mind map), " +
    "network-graph (network graph), " +
    "organization-chart (organizational chart), " +
    "path-map (path map for routes), " +
    "pie (pie chart for proportions), " +
    "pin-map (pin map for POI distribution), " +
    "radar (radar chart for multi-dimensional data), " +
    "sankey (sankey diagram for flow), " +
    "scatter (scatter plot), " +
    "treemap (treemap for hierarchical data), " +
    "venn (venn diagram), " +
    "violin (violin plot for distribution), " +
    "word-cloud (word cloud)"
  ),
  data: z.any().describe(
    "The data for the chart. The structure depends on the chart type:\n" +
    "- For line/area/bar/column: array of {time/category: string, value: number, group?: string}\n" +
    "- For pie: array of {name: string, value: number}\n" +
    "- For scatter: array of {x: number, y: number, group?: string}\n" +
    "- For network/sankey: {nodes: array, edges/links: array}\n" +
    "- For map charts: varies by map type (see specific tool descriptions)\n" +
    "- For other charts: refer to the specific chart type documentation"
  ),
  style: z.object({
    texture: z.enum(["default", "rough"]).optional().describe("Chart texture style. 'rough' for hand-drawn style."),
    backgroundColor: z.string().optional().describe("Background color, e.g., '#fff'"),
    palette: z.array(z.string()).optional().describe("Color palette array"),
    lineWidth: z.number().optional().describe("Line width for line-based charts"),
  }).optional().describe("Custom style configuration for the chart"),
  theme: z.enum(["default", "academy", "dark"]).optional().describe("Chart theme"),
  width: z.number().optional().describe("Chart width in pixels (default: 600, for maps: 1600)"),
  height: z.number().optional().describe("Chart height in pixels (default: 400, for maps: 1000)"),
  title: z.string().optional().describe("Chart title"),
  axisXTitle: z.string().optional().describe("X-axis title (for applicable chart types)"),
  axisYTitle: z.string().optional().describe("Y-axis title (for applicable chart types)"),
};

// Unified chart tool descriptor
const tool = {
  name: "generate_chart",
  description:
    "Universal chart generation tool that can create any type of supported chart (25+ types). " +
    "Specify the 'type' parameter to choose the chart type, then provide appropriate data and configuration. " +
    "This is a convenient alternative to using individual chart generation tools. " +
    "Supports: line charts, bar charts, pie charts, scatter plots, maps, diagrams, and many more.",
  inputSchema: zodToJsonSchema(schema),
};

export const unified = {
  schema,
  tool,
};
