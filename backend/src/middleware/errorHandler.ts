import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    const message = err.errors
      .map((e) => `${e.path.join(".") || "query"}: ${e.message}`)
      .join("; ");
    return res.status(400).json({
      status: "error",
      message: `Validation failed - ${message}`,
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
