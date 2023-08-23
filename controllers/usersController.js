const Users = require("../models/UsersSchema.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const validationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const usersController = {
  async signupUser(req, res) {
    try {
      const { email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const createUser = await Users.create({
        email: email,
        password: hashedPassword,
        token: token,
      });
      req.session.userToken = token;
      res.status(201).json(createUser);
    } catch (err) {
      console.log(err);
      res.status(409).json({ message: "Email in use" });
    }
  },

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email: email }).select(
        "email password subscription"
      );
      const id = user._id;
      if (!user) {
        res.json({ message: "No user found with that account" });
        return;
      }

      const { error } = validationSchema.validate({ email, password });
      if (error) return res.json(error);

      bcrypt.compare(password, user.password, async (err, data) => {
        if (err) throw new Error(err);

        if (data) {
          const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
          });
          user.token = token;
          await user.save();
          req.session.userToken = token;
          req.session.currentUserId = user._id;
          res.status(200).json({ email, subscription: user.subscription });
        } else {
          return res
            .status(401)
            .json({ message: "Email or password is wrong" });
        }
      });
    } catch (err) {
      res.json({ message: err });
    }
  },
  async logoutUser(req, res) {
    const id = req.user._id;
    console.log(id);
    try {
      await Users.findOneAndUpdate({ _id: id }, { $set: { token: null } });
      res.status(204).json({});
    } catch (error) {
      res.status(401).json({ message: "Not authorized" });
    }
  },
  async currentUser(req, res) {
    const id = req.user._id;
    try {
      const user = await Users.findOne({ _id: id }).select(
        "email subscription -_id"
      );
      res.status(200).json({ user });
    } catch (error) {
      res.status(400).json({ message: "Not authorized" });
    }
  },
};

module.exports = usersController;
