const AppError = require("../utils/AppError");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.stack);

  if (!res.headersSent) {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";
    const message = err.isOperational ? err.message : "Internal server error.";

    res.status(statusCode).json({ status, message });

    if (status === "error") {
      console.error("Error details:", req.method, req.path, err);
    }
  }
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: "path not found" });
};

module.exports = { errorHandler, notFoundHandler, AppError };
