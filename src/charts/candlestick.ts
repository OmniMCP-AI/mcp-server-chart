import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  AxisXTitleSchema,
  AxisYTitleSchema,
  BackgroundColorSchema,
  HeightSchema,
  PaletteSchema,
  ThemeSchema,
  TitleSchema,
  WidthSchema,
} from "./base";

// Candlestick chart data schema
const data = z.object({
  date: z.string().describe("Trading date, e.g., '2024-01-01'"),
  open: z.number().describe("Opening price"),
  close: z.number().describe("Closing price"),
  high: z.number().describe("Highest price"),
  low: z.number().describe("Lowest price"),
  volume: z.number().optional().describe("Trading volume (optional)"),
});

// Candlestick chart input schema
const schema = {
  data: z
    .array(data)
    .describe(
      "Data for candlestick chart (K-line chart), each object contains date, open, close, high, low, and optionally volume fields. Used for stock, cryptocurrency, or financial instrument price visualization.",
    )
    .nonempty({ message: "Candlestick chart data cannot be empty." }),
  style: z
    .object({
      backgroundColor: BackgroundColorSchema,
      palette: PaletteSchema,
      showVolume: z
        .boolean()
        .optional()
        .default(true)
        .describe("Whether to show volume chart below candlestick chart"),
      upColor: z
        .string()
        .optional()
        .default("#f04864")
        .describe("Color for bullish candles (price up)"),
      downColor: z
        .string()
        .optional()
        .default("#2fc25b")
        .describe("Color for bearish candles (price down)"),
      candleWidth: z
        .number()
        .optional()
        .describe("Width of candlestick bars"),
    })
    .optional()
    .describe("Custom style configuration for the chart."),
  theme: ThemeSchema,
  width: WidthSchema,
  height: HeightSchema,
  title: TitleSchema,
  axisXTitle: AxisXTitleSchema,
  axisYTitle: AxisYTitleSchema,
};

// Candlestick chart tool descriptor
const tool = {
  name: "generate_candlestick_chart",
  description:
    "Generate a candlestick chart (K-line chart) to display stock price movements, including opening price, closing price, highest price, and lowest price. Commonly used for financial market analysis, stock trading, cryptocurrency price tracking, futures, forex, and other financial instruments.",
  inputSchema: zodToJsonSchema(schema),
};

export const candlestick = {
  schema,
  tool,
};
