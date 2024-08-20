const axios = require("axios");
const RealResult = require("../models/RealResult.model");
const User = require("../models/User.model");
const Prediction = require("../models/Predictions.model");

// Function to update user scores
const updateScores = async () => {
  try {
    const predictions = await Prediction.find({});
    const results = await RealResult.find({});

    const userScores = {};

    // To store the predictions to update in bulk later
    const predictionsToUpdate = [];

    predictions.forEach((prediction) => {
      // Check if this prediction has already been processed
      if (prediction.processed) return;

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

        // Mark the prediction as processed for later update
        prediction.processed = true;
        predictionsToUpdate.push(prediction);
      }
    });

    // Update users' scores in the database
    await Promise.all(
      Object.keys(userScores).map(async (userId) => {
        const user = await User.findById(userId);
        if (user) {
          user.score += userScores[userId].score;
          user.correctScores += userScores[userId].correctScores;
          user.correctOutcomes += userScores[userId].correctOutcomes;
          await user.save();
        } else {
          console.warn(`User with ID ${userId} not found.`);
        }
      })
    );

    // Bulk update the predictions after processing
    await Promise.all(
      predictionsToUpdate.map((prediction) => prediction.save())
    );

    // Update positions and other related data if needed
    await updateUserPositions();

    console.log("Scores updated successfully!");
  } catch (error) {
    console.error("Error updating scores:", error.message);
  }
};

// Function to update user positions (optional)
const updateUserPositions = async () => {
  // Your logic to update user positions based on their scores
  // If this is not needed, you can remove the call to it in updateScores
};

module.exports = { updateScores };
