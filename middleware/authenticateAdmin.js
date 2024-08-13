const authenticateAdmin = (req, res, next) => {
  if (req.payload && req.payload.role === "admin") {
    next(); // User is an admin, proceed to the next middleware or route handler
  } else {
    res.status(403).send({ error: "Not authorized as admin" }); // User is not an admin, return Forbidden
  }
};

module.exports = authenticateAdmin;
