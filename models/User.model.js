const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, required: true, default: "" },
  score: { type: Number, default: 0 },
  correctScores: { type: Number, default: 0 },
  correctOutcomes: { type: Number, default: 0 },
  movement: { type: String, default: "" },
  position: { type: Number, default: 0 },
  previousPosition: { type: Number, default: 0 }, // Add previousPosition field
  role: { type: String, enum: ["user", "admin"], default: "user" }, // Define user roles
});

module.exports = model("User", userSchema);
