require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const { createServer } = require("http");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

const server = createServer(app);

const authRoutes = require("./routes/auth.router");
const userRoutes = require("./routes/user.router");
const predictionRoutes = require("./routes/prediction.router");
const realResultRoutes = require("./routes/realResult.router");

const { errorHandler, notFoundHandler } = require("./middleware/errorHandling");

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to MongoDB
const connectionString = process.env.DATABASE_URL;
const { allowedOrigins } = require("./config/config");
// Log the environment and connection target
// console.log(
//   `Connecting to database at ${
//     process.env.NODE_ENV === "development" ? "local development" : "production"
//   } environment.`
// );

mongoose
  .connect(connectionString)
  .then((connection) =>
    console.log(`Connected to Database: "${connection.connections[0].name}"`)
  )
  .catch((err) => {
    console.error("Error connecting to the DB", err);
    process.exit(1); // Exit the process if the database connection fails
  });

// Middleware
app.use(
  cors({
    origin: [
      allowedOrigins,
      process.env.ORIGIN,
      "https://epl2024.netlify.app/",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/results", realResultRoutes);

// Error handling middleware
app.use(errorHandler);
app.use(notFoundHandler);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on port ${PORT}`);
});
