const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User.model");
const RealResult = require("../models/RealResult.model");
const Prediction = require("../models/Predictions.model");
const { authenticateToken } = require("../middleware/authenticateToken");
const { AppError } = require("../middleware/errorHandling");
const updateUserPositionsAndMovements = require("../utils/userPosition");

// Get user details (protected)
router.get(
  "/protected/user/:userId",
  authenticateToken,
  async (req, res, next) => {
    console.log("Requested user ID:", req.params.userId);
    try {
      const userId = req.params.userId;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError("Invalid user ID", 400);
      }

      const user = await User.findById(userId);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      const {
        _id,
        email,
        userName,
        profileImage,
        score,
        position,
        movement,
        previousPosition,
      } = user;

      res.status(200).json({
        _id,
        email,
        userName,
        profileImage,
        score,
        position,
        movement,
        previousPosition,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Find all users and update positions
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ score: -1 });

    console.log("Fetched users:", users);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    next(error);
  }
});

// Update user scores
router.put("/updateScores", async (req, res, next) => {
  try {
    // Fetch all predictions and results
    const predictions = await Prediction.find({});
    const results = await RealResult.find({});

    const userScores = {};
    const predictionsToUpdate = [];

    predictions.forEach((prediction) => {
      if (prediction.calculated) return;

      const result = results.find((r) => r.fixtureId === prediction.fixtureId);
      if (result) {
        let score = 0;
        let correctScores = 0;
        let correctOutcomes = 0;

        if (
          prediction.homeScore === result.homeScore &&
          prediction.awayScore === result.awayScore &&
          prediction.outcome === result.outcome
        ) {
          score = 7;
          correctScores = 1;
          correctOutcomes = 1;
        } else if (prediction.outcome === result.outcome) {
          score = 3;
          correctOutcomes = 1;
        }

        if (!userScores[prediction.userId]) {
          userScores[prediction.userId] = {
            score: 0,
            correctScores: 0,
            correctOutcomes: 0,
          };
        }

        userScores[prediction.userId].score += score;
        userScores[prediction.userId].correctScores += correctScores;
        userScores[prediction.userId].correctOutcomes += correctOutcomes;

        prediction.calculated = true;
        predictionsToUpdate.push(prediction);
      }
    });

    await Promise.all(
      Object.keys(userScores).map(async (userId) => {
        const user = await User.findById(userId);
        if (user) {
          const previousPosition = user.position;
          user.score += userScores[userId].score;
          user.correctScores += userScores[userId].correctScores;
          user.correctOutcomes += userScores[userId].correctOutcomes;

          const allUsers = await User.find({}).sort({ score: -1 });
          user.position =
            allUsers.findIndex((u) => u._id.toString() === userId) + 1;
          user.previousPosition = previousPosition; // Ensure previousPosition is updated

          await user.save();
        } else {
          console.warn(`User with ID ${userId} not found.`);
        }
      })
    );

    await Prediction.bulkWrite(
      predictionsToUpdate.map((prediction) => ({
        updateOne: {
          filter: { _id: prediction._id },
          update: { calculated: true },
        },
      }))
    );

    await updateUserPositionsAndMovements();

    console.log("Scores updated successfully!");
    res.status(200).json({ message: "User scores updated successfully" });
  } catch (error) {
    console.error("Error updating scores:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to update user positions and movements
router.post("/updatePositions", async (req, res) => {
  try {
    await updateUserPositionsAndMovements();

    res
      .status(200)
      .json({ message: "User positions and movements updated successfully." });
  } catch (error) {
    console.error("Error updating user positions and movements:", error);
    res
      .status(500)
      .json({ message: "Error updating user positions and movements." });
  }
});

module.exports = router;
