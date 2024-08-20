const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.JWT_SECRET; // Ensure this matches your server setup

const payload = {
  userId: "66a7bc3d546173e02e9ccc26", // Example payload data
  role: "admin",
};

const token = jwt.sign(payload, secret);

console.log("Generated JWT Token:", token);
