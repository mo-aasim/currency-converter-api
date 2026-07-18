import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4002,
  nodeEnv: process.env.NODE_ENV || "development",
  currencyApiBase:
    process.env.CURRENCY_API_BASE ||
    "https://open.er-api.com/v6/latest",
  cacheTtl: Number(process.env.CACHE_TTL) || 3600,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 60,
  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 900000,
};
