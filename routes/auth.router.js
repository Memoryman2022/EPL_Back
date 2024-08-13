const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User.model");
const { AppError } = require("../middleware/errorHandling");
const { authenticateToken } = require("../middleware/authenticateToken");
const authenticateAdmin = require("../middleware/authenticateAdmin");

const router = express.Router();
const saltRounds = 10;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Post /register
router.post(
  "/register",
  upload.single("profileImage"),
  async (req, res, next) => {
    try {
      const { userName, email, password, role } = req.body;
      const profileImage = req.file ? `/uploads/${req.file.filename}` : "";

      if (userName === "" || email === "" || password === "") {
        throw new AppError("Please fill out the registration fields", 400);
      }

      const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/);
      if (!emailRegex.test(email)) {
        throw new AppError("Email must be a valid email", 400);
      }

      const passwordRegex = new RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/);
      if (!passwordRegex.test(password)) {
        throw new AppError(
          "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
          400
        );
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError("Email already in use", 400);
      }

      const hashedPassword = bcrypt.hashSync(
        password,
        bcrypt.genSaltSync(saltRounds)
      );

      const createdUser = await User.create({
        email,
        password: hashedPassword,
        userName,
        profileImage,
        role: role || "user", // Set role or default to "user"
      });

      console.log("User created:", createdUser);

      const token = jwt.sign(
        { userId: createdUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "6h" }
      );

      console.log("Generated token:", token);

      res
        .status(201)
        .json({ token, userId: createdUser._id, user: createdUser });
    } catch (err) {
      console.error("Error during registration:", err);
      next(err);
    }
  }
);

// Post /register/admin (Only for authenticated admin users)
router.post(
  "/register/admin",
  authenticateToken,
  authenticateAdmin,
  upload.single("profileImage"),
  async (req, res, next) => {
    try {
      const { userName, email, password } = req.body;
      const profileImage = req.file ? `/uploads/${req.file.filename}` : "";

      if (userName === "" || email === "" || password === "") {
        throw new AppError("Please fill out the registration fields", 400);
      }

      const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/);
      if (!emailRegex.test(email)) {
        throw new AppError("Email must be a valid email", 400);
      }

      const passwordRegex = new RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/);
      if (!passwordRegex.test(password)) {
        throw new AppError(
          "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
          400
        );
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError("Email already in use", 400);
      }

      const hashedPassword = bcrypt.hashSync(
        password,
        bcrypt.genSaltSync(saltRounds)
      );

      const createdUser = await User.create({
        email,
        password: hashedPassword,
        userName,
        profileImage,
        role: "admin", // Explicitly set role to "admin"
      });

      console.log("Admin created:", createdUser);

      const token = jwt.sign(
        { userId: createdUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "6h" }
      );

      console.log("Generated token:", token);

      res
        .status(201)
        .json({ token, userId: createdUser._id, user: createdUser });
    } catch (err) {
      console.error("Error during admin registration:", err);
      next(err);
    }
  }
);

// Post /login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("Login request received with email:", email);
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      console.log("User not found for email:", email);
      throw new AppError("User not found", 400);
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      console.log("Incorrect password for email:", email);
      throw new AppError("Incorrect password", 400);
    }

    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    console.log("Generated token:", token);

    const user = {
      _id: existingUser._id,
      userName: existingUser.userName,
      email: existingUser.email,
      profileImage: existingUser.profileImage,
      score: existingUser.score,
      position: existingUser.position,
      role: existingUser.role, // Include role in response
    };

    res.status(200).json({ token, userId: existingUser._id, user });
  } catch (err) {
    console.error("Error during login:", err);
    next(err);
  }
});

// Get /verify
router.get("/verify", authenticateToken, (req, res) => {
  res.status(200).json(req.payload);
});

module.exports = router;
