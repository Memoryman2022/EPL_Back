const axios = require("axios");

// Function to trigger the /updateResults route on your deployed backend
const triggerUpdateResults = async () => {
  try {
    const response = await axios.get(
      "https://eplbackend.adaptable.app/api/updateResults"
    );
    console.log("Update Results Response:", response.data);
  } catch (error) {
    console.error(
      "Error executing updateResults:",
      error.response ? error.response.data : error.message
    );
  }
};

// Call the function wherever needed in your backend
triggerUpdateResults();
