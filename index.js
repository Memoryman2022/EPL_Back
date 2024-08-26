require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const { createServer } = require("http");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cron = require("node-cron");
const axios = require("axios");

const app = express();

const server = createServer(app);

const authRoutes = require("./routes/auth.router");
const userRoutes = require("./routes/user.router");
const predictionRoutes = require("./routes/prediction.router");
const realResultRoutes = require("./routes/realResult.router");
const externalApiRouter = require("./routes/externalApi.router");
const adminRoutes = require(".routes/admin.router");

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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Save files to the uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to file name
  },
});

const upload = multer({ storage });

// File upload route
app.post("/upload", upload.single("profileImage"), (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "File uploaded successfully", file: req.file });
  } catch (error) {
    res.status(500).json({ message: "Error uploading file", error });
  }
});

// Route to serve files from the uploads directory
app.get("/uploads/:filename", (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      next(err); // Forward to error handling middleware
    }
  });
});

// Connect to MongoDB ///
const connectionString = process.env.DATABASE_URL;
//const connectionString = process.env.MONGODB_URI_LOCAL;

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
app.use("/uploads", express.static(path.join(__dirname, "api/uploads")));

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/results", realResultRoutes);
app.use("/api", externalApiRouter);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use(errorHandler);
app.use(notFoundHandler);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on port ${PORT}`);
});
