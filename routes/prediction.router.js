const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Prediction = require("../models/Predictions.model");
const { authenticateToken } = require("../middleware/authenticateToken.js");

router.post("/", async (req, res) => {
  console.log("Received payload on backend:", req.body);
  const { fixtureId, userId, homeScore, awayScore, outcome } = req.body;

  // Validate required fields
  if (
    !fixtureId ||
    !userId ||
    homeScore === undefined ||
    awayScore === undefined ||
    !outcome
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate data types and values
  if (
    typeof fixtureId !== "number" ||
    typeof userId !== "string" ||
    typeof homeScore !== "number" ||
    typeof awayScore !== "number"
  ) {
    return res.status(400).json({ message: "Invalid data types" });
  }

  if (!["homeWin", "awayWin", "draw"].includes(outcome)) {
    return res.status(400).json({ message: "Invalid outcome value" });
  }

  try {
    // Validate userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Save the prediction to the database
    const prediction = new Prediction({
      fixtureId,
      userId,
      homeScore,
      awayScore,
      outcome,
    });

    await prediction.save();
    res.status(200).json(prediction);
  } catch (error) {
    console.error("Error saving prediction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const predictions = await Prediction.find({ userId });

    if (!predictions.length) {
      return res
        .status(404)
        .json({ message: "No predictions found for this user" });
    }

    res.status(200).json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// New route to get predictions by fixtureId
router.get("/fixture/:fixtureId", authenticateToken, async (req, res) => {
  try {
    const { fixtureId } = req.params;

    if (!fixtureId) {
      return res.status(400).json({ message: "Missing fixture ID" });
    }

    const predictions = await Prediction.find({ fixtureId });

    if (!predictions.length) {
      return res
        .status(404)
        .json({ message: "No predictions found for this fixture" });
    }

    res.status(200).json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Example routes in prediction.router.js
router.get("/", authenticateToken, async (req, res) => {
  try {
    const predictions = await Prediction.find({});

    if (!predictions.length) {
      return res.status(404).json({ message: "No predictions found" });
    }

    res.status(200).json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
