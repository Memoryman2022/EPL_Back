require("dotenv").config();
const { expressjwt: jwt } = require("express-jwt");

// console.log("JWT_SECRET:", process.env.JWT_SECRET);

const getTokenFromHeaders = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const authenticateToken = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "payload",
  getToken: getTokenFromHeaders,
});

module.exports = { authenticateToken };
