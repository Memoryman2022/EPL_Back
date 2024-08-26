// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const RealResult = require("../models/RealResult.model");
// const { updateScores } = require("../utils/upateScores");
// const { authenticateToken } = require("../middleware/authenticateToken");

// // Middleware to check if the user is an admin
// const adminAuth = (req, res, next) => {
//   if (req.user && req.user.isAdmin) {
//     next();
//   } else {
//     res.status(403).json({ message: "Access denied" });
//   }
// };

// // Endpoint to manually trigger update of match results
// router.post(
//   "/updateResults",
//   authenticateToken,
//   adminAuth,
//   async (req, res) => {
//     try {
//       const response = await axios.get(
//         "https://api.football-data.org/v4/competitions/2021/matches?status=FINISHED",
//         {
//           headers: { "X-Auth-Token": process.env.EXTERNAL_API_KEY },
//         }
//       );
//       const matches = response.data.matches;
//       for (const match of matches) {
//         const outcome = getOutcomeFromScore(match.score);
//         const realResultData = {
//           fixtureId: match.id,
//           homeTeam: match.homeTeam.name,
//           awayTeam: match.awayTeam.name,
//           homeScore: match.score.fullTime.home,
//           awayScore: match.score.fullTime.away,
//           outcome,
//           date: match.utcDate,
//           matchday: matchData.matchday,
//         };
//         await RealResult.findOneAndUpdate(
//           { fixtureId: match.id },
//           realResultData,
//           { upsert: true, new: true }
//         );
//       }
//       res.status(200).json({ message: "Match results updated successfully" });
//     } catch (error) {
//       console.error("Error updating match results:", error);
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   }
// );

// // Endpoint to manually trigger update of user scores
// router.post("/updateScores", authenticateToken, adminAuth, async (req, res) => {
//   try {
//     await updateScores();
//     res.status(200).json({ message: "User scores updated successfully" });
//   } catch (error) {
//     console.error("Error updating user scores:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// // Helper function to determine outcome
// const getOutcomeFromScore = (score) => {
//   if (score.winner === "HOME_TEAM") return "homeWin";
//   if (score.winner === "AWAY_TEAM") return "awayWin";
//   if (score.winner === "DRAW") return "draw";
//   return "unknown";
// };

// module.exports = router;
