require("dotenv").config();

const MONGO_URI =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL
    : process.env.MONGODB_URI_LOCAL;

const allowedOrigins = [
  process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : process.env.ORIGIN,
];

module.exports = {
  MONGO_URI,
  allowedOrigins,
};
