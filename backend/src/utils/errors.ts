export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const asyncHandler =
  <T extends (...args: any[]) => Promise<any>>(fn: T) =>
  (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);
