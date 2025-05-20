class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Operational error is error produced by users

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
