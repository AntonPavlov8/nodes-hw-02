const session = require("express-session");
const jwt = require("jsonwebtoken");
const Users = require("../models/UsersSchema");

const auth = async (req, res, next) => {
  const token = req.session.userToken;
  const secretKey = process.env.JWT_SECRET;

  try {
    const decodedToken = jwt.verify(token, secretKey);
    try {
      const user = await Users.findOne({ _id: decodedToken.userId });
      req.user = user;
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: "Not authorized" });
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
  if (!req.session.userToken) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }
};

module.exports = auth;
