import rateLimit from "express-rate-limit";
import { config } from "../utils/config";

export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many requests, slow down." },
});
