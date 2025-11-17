import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { getServiceIdentifier, getVisRequestServer } from "./env";
import { renderCandlestickChart } from "./renderChart";
import { uploadImage } from "./uploadImage";

/**
 * Generate a chart URL using the provided configuration.
 * @param type The type of chart to generate
 * @param options Chart options
 * @returns {Promise<string>} The generated chart URL.
 * @throws {Error} If the chart generation fails.
 */
export async function generateChartUrl(
  type: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  options: Record<string, any>,
): Promise<string> {
  try {
    const url = getVisRequestServer();

    const response = await axios.post(
      url,
      {
        type,
        ...options,
        source: "mcp-server-chart",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const { success, errorMessage, resultObj } = response.data;

    if (!success) {
      throw new Error(errorMessage || "Chart generation failed");
    }

    return resultObj;
  } catch (error: any) {
    // Re-throw with more context if it's a network error
    if (error.message && !error.response) {
      throw new Error(`Failed to generate chart URL: ${error.message}`);
    }
    throw error;
  }
}

type ResponseResult = {
  metadata: unknown;
  /**
   * @docs https://modelcontextprotocol.io/specification/2025-03-26/server/tools#tool-result
   */
  content: CallToolResult["content"];
  isError?: CallToolResult["isError"];
};

/**
 * Generate a map
 * @param tool - The tool name
 * @param input - The input
 * @returns
 */
export async function generateMap(
  tool: string,
  input: unknown,
): Promise<ResponseResult> {
  try {
    const url = getVisRequestServer();

    const response = await axios.post(
      url,
      {
        serviceId: getServiceIdentifier(),
        tool,
        input,
        source: "mcp-server-chart",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const { success, errorMessage, resultObj } = response.data;

    if (!success) {
      throw new Error(errorMessage || "Map generation failed");
    }
    return resultObj;
  } catch (error: any) {
    // Re-throw with more context if it's a network error
    if (error.message && !error.response) {
      throw new Error(`Failed to generate map: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Generate a stock chart (candlestick) using built-in SSR or custom service
 * @param options Chart options
 * @returns {Promise<string>} The generated chart URL after uploading to file service.
 * @throws {Error} If the chart generation fails.
 */
export async function generateStockChart(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  options: Record<string, any>,
): Promise<string> {
  // Try local SSR rendering first (no external dependencies!)
  try {
    const base64Image = await renderCandlestickChart(options);

    // Upload image to file service and get public URL
    const imageUrl = await uploadImage(base64Image, "candlestick-chart.png");
    return imageUrl;
  } catch (localError: any) {
    // If local rendering fails, try external service as fallback
    const customServiceUrl = process.env.STOCK_CHART_SERVICE;

    if (!customServiceUrl) {
      // If no fallback service, provide helpful error message
      throw new Error(
        `Local stock chart rendering failed: ${localError.message}\n\n` +
          `To use an external rendering service, configure STOCK_CHART_SERVICE environment variable.\n` +
          `Example: STOCK_CHART_SERVICE=http://localhost:3001/api/candlestick`,
      );
    }

    // Try external service
    try {
      const { data, width = 800, height = 600, title = "", style = {}, theme = "default" } = options;

      // Use custom rendering service
      const response = await axios.post(
        customServiceUrl,
        {
          data,
          width,
          height,
          title,
          style,
          theme,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer", // Get binary data
          timeout: 30000,
        },
      );

      // Convert to base64
      const base64Image = Buffer.from(response.data, "binary").toString("base64");
      const base64DataUri = `data:image/png;base64,${base64Image}`;

      // Upload image to file service and get public URL
      const imageUrl = await uploadImage(base64DataUri, "candlestick-chart.png");
      return imageUrl;
    } catch (error: any) {
      // Re-throw with more context if it's a network error
      if (error.message && !error.response) {
        throw new Error(`Failed to generate stock chart: ${error.message}`);
      }
      throw error;
    }
  }
}
