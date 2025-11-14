import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { getServiceIdentifier, getVisRequestServer } from "./env";

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
