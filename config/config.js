require("dotenv").config();

const MONGO_URI =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL
    : process.env.MONGODB_URI_LOCAL;

const allowedOrigins = [
  // process.env.NODE_ENV === "production"
  "http://localhost:5173",
  process.env.ORIGIN,
  "https://epl2024.netlify.app",
];

module.exports = {
  MONGO_URI,
  allowedOrigins,
};
