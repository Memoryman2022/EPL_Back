const User = require("../models/User.model");

const updateUserPositionsAndMovements = async () => {
  try {
    // Fetch all users sorted by their current score in descending order
    const users = await User.find().sort({ score: -1 });

    // Iterate over each user to determine their new position and movement
    const updates = users.map(async (user, index) => {
      const previousPosition = user.position;
      const newPosition = index + 1;
      let movement = "";

      if (previousPosition && newPosition < previousPosition) {
        movement = "up";
      } else if (previousPosition && newPosition > previousPosition) {
        movement = "down";
      }

      return User.findByIdAndUpdate(user._id, {
        position: newPosition,
        movement: movement,
        previousPosition: previousPosition || newPosition,
      });
    });

    await Promise.all(updates);
  } catch (error) {
    console.error("Error updating user positions and movements:", error);
  }
};

module.exports = updateUserPositionsAndMovements;
