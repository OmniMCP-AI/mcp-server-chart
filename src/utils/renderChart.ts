/**
 * Local chart rendering using ECharts + node-canvas
 * No external HTTP calls needed - renders directly in Node.js
 */

import { createCanvas, registerFont } from "canvas";
import * as echarts from "echarts/core";
import { CandlestickChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import * as fs from "fs";
import * as path from "path";

// Register required components
echarts.use([CandlestickChart, TitleComponent, TooltipComponent, GridComponent, CanvasRenderer]);

// Register custom fonts from fonts directory
function registerCustomFonts() {
  const fontsDir = path.join(process.cwd(), "fonts");

  if (!fs.existsSync(fontsDir)) {
    console.warn(`Fonts directory not found: ${fontsDir}`);
    return false;
  }

  try {
    const fontFiles = fs.readdirSync(fontsDir);
    let registered = false;

    for (const file of fontFiles) {
      const fontPath = path.join(fontsDir, file);
      const ext = path.extname(file).toLowerCase();

      // Support common font formats
      if (['.ttf', '.ttc', '.otf'].includes(ext)) {
        try {
          registerFont(fontPath, { family: "CustomFont" });
          console.log(`Registered font: ${file}`);
          registered = true;
        } catch (error) {
          console.warn(`Failed to register font ${file}:`, error);
        }
      }
    }

    return registered;
  } catch (error) {
    console.warn(`Error reading fonts directory:`, error);
    return false;
  }
}

// Register fonts on module load
registerCustomFonts();

/**
 * Render a candlestick chart using ECharts and node-canvas
 * @param options Chart configuration options
 * @returns Base64 encoded PNG image
 */
export async function renderCandlestickChart(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  options: Record<string, any>,
): Promise<string> {
  const { data, width = 800, height = 600, title = "", style = {}, theme = "default" } = options;

  // Create canvas instance
  const canvas = createCanvas(width, height);

  // Initialize ECharts with canvas
  const chart = echarts.init(canvas as any);

  // Build ECharts configuration
  const echartsConfig = {
    backgroundColor: style.backgroundColor || (theme === "dark" ? "#1e1e1e" : "#ffffff"),
    title: {
      text: title,
      left: "center",
      textStyle: {
        color: theme === "dark" ? "#ffffff" : "#333333",
        fontFamily: "CustomFont, Arial, sans-serif",
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      textStyle: {
        fontFamily: "CustomFont, Arial, sans-serif",
      },
    },
    xAxis: {
      type: "category",
      data: data.map((d: any) => d.date),
      axisLabel: {
        color: theme === "dark" ? "#ffffff" : "#333333",
        fontFamily: "CustomFont, Arial, sans-serif",
      },
    },
    yAxis: {
      scale: true,
      axisLabel: {
        color: theme === "dark" ? "#ffffff" : "#333333",
        fontFamily: "CustomFont, Arial, sans-serif",
      },
    },
    grid: {
      left: "10%",
      right: "10%",
      bottom: "15%",
    },
    series: [
      {
        type: "candlestick",
        data: data.map((d: any) => [d.open, d.close, d.low, d.high]),
        itemStyle: {
          color: style.upColor || "#ef232a",
          color0: style.downColor || "#14b143",
          borderColor: style.upColor || "#ef232a",
          borderColor0: style.downColor || "#14b143",
        },
      },
    ],
  };

  // Set chart option
  chart.setOption(echartsConfig);

  // Render chart and get buffer
  const buffer = (canvas as any).toBuffer("image/png");

  // Clean up
  chart.dispose();

  // Convert to base64
  const base64Image = buffer.toString("base64");
  return `data:image/png;base64,${base64Image}`;
}
