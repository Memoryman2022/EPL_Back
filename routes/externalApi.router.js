const express = require("express");
const router = express.Router();
const axios = require("axios");

// Replace with your actual API key
const EXTERNAL_API_KEY = process.env.EXTERNAL_API_KEY; // Store this securely

// Define the route that the frontend will call
router.get("/competitions/2021/standings", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.football-data.org/v4/competitions/2021/standings",
      {
        headers: {
          "X-Auth-Token": EXTERNAL_API_KEY,
        },
      }
    );
    res.json(response.data); // Send data to frontend
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    res.status(error.response?.status || 500).send(error.message);
  }
});

// Match days for calendar
router.get("/competitions/2021/matches", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.football-data.org/v4/competitions/2021/matches",
      {
        headers: {
          "X-Auth-Token": EXTERNAL_API_KEY,
        },
      }
    );
    res.json(response.data); // Send data to frontend
  } catch (error) {
    console.error("Error fetching fixtures from external API:", error);
    res.status(error.response?.status || 500).send(error.message);
  }
});

module.exports = router;
