const express = require("express");
const router = express.Router();
const axios = require("axios");

const EXTERNAL_API_KEY = process.env.EXTERNAL_API_KEY;

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

module.exports = router;
