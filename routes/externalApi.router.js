const express = require("express");
const router = express.Router();
const axios = require("axios");
const RealResult = require("../models/RealResult.model");

const EXTERNAL_API_KEY = process.env.EXTERNAL_API_KEY;

const getOutcomeFromScore = (score) => {
  if (score.winner === "HOME_TEAM") return "homeWin";
  if (score.winner === "AWAY_TEAM") return "awayWin";
  if (score.winner === "DRAW") return "draw";
  return "unknown";
};

router.get("/competitions/2021/standings", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.football-data.org/v4/competitions/2021/standings",
      {
        headers: { "X-Auth-Token": EXTERNAL_API_KEY },
      }
    );
    res.json(data);
  } catch (error) {
    console.error("Error fetching standings:", error);
    res.status(error.response?.status || 500).send(error.message);
  }
});

router.get("/competitions/2021/matches", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.football-data.org/v4/competitions/2021/matches",
      {
        headers: { "X-Auth-Token": EXTERNAL_API_KEY },
      }
    );
    res.json(data);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(error.response?.status || 500).send(error.message);
  }
});

// Route to update results in the database
router.get("/updateResults", async (req, res) => {
  try {
    // Fetch finished matches
    const { data } = await axios.get(
      "https://api.football-data.org/v4/competitions/2021/matches?status=FINISHED",
      {
        headers: { "X-Auth-Token": EXTERNAL_API_KEY },
      }
    );

    // Process and save each match
    await Promise.all(
      data.matches.map(async (match) => {
        // Determine match outcome
        const outcome = getOutcomeFromScore(match.score);

        // Prepare data for saving
        const realResultData = {
          fixtureId: match.id,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          homeScore:
            match.score.fullTime.home !== null ? match.score.fullTime.home : 0,
          awayScore:
            match.score.fullTime.away !== null ? match.score.fullTime.away : 0,
          outcome,
          date: new Date(match.utcDate),
        };

        // Log data to be saved
        console.log("Saving data:", realResultData);

        // Upsert the match result data into the database
        await RealResult.findOneAndUpdate(
          { fixtureId: match.id },
          realResultData,
          { upsert: true, new: true }
        );
      })
    );

    // Respond with success message
    res.status(200).json({ message: "Match results updated successfully" });
  } catch (error) {
    console.error("Error updating match results:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
