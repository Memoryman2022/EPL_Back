const express = require("express");
const router = express.Router(); // Corrected the syntax
const axios = require("axios");

// Replace with your actual API key
const EXTERNAL_API_KEY = process.env.EXTERNAL_API_KEY; // Make sure to store this securely

// External API base URL
const API_URL = "https://api.football-data.org/v4";

// Define the route that the frontend will call to get standings
router.get("/competitions/2021/standings", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/competitions/2021/standings`, {
      headers: {
        "X-Auth-Token": EXTERNAL_API_KEY,
      },
    });
    res.json(response.data); // Send data to frontend
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    res.status(error.response?.status || 500).send(error.message);
  }
});

// Define the route that the frontend will call to get match days for the calendar
router.get("/competitions/2021/matches", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/competitions/2021/matches`, {
      headers: {
        "X-Auth-Token": EXTERNAL_API_KEY,
      },
    });
    res.json(response.data); // Send data to frontend
  } catch (error) {
    console.error("Error fetching fixtures from external API:", error);
    res.status(error.response?.status || 500).send(error.message);
  }
});

module.exports = router;
