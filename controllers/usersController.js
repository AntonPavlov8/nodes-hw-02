const Users = require("../models/UsersSchema.js");
const { v4: uuid } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const multer = require("multer");
const fs = require("fs").promises;
const jimp = require("jimp");
const path = require("path");
const tmpStorage = path.join(process.cwd(), "tmp");
const imagesPath = path.join(process.cwd(), "public/avatars");
var gravatar = require("gravatar");
const sendVerifyMail = require("./sendVerifyMail.js");

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
      const newVerificationToken = uuid();
      var url = gravatar.url(email, { s: "100", r: "x", d: "retro" }, true);
      const createUser = await Users.create({
        email: email,
        password: hashedPassword,
        avatarURL: url,
        token: token,
        verify: false,
        verificationToken: newVerificationToken,
      });
      req.session.userToken = token;
      sendVerifyMail(email, (verificationToken = newVerificationToken));
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
        "email password subscription verify"
      );
      if (!user.verify) {
        res.json({ message: "User's email is not verified" });
      }
      const id = user._id;
      if (!user) {
        res.status(404).json({ message: "No user found with that account" });
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
          res.status(200).json({ email, subscription: user.subscription });
        } else {
          res.status(401).json({ message: "Email or password is wrong" });
        }
      });
    } catch (err) {
      console.log(err);
      res.json({ message: err });
    }
  },
  async logoutUser(req, res) {
    const id = req.user._id;
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
  async updateAvatar(req, res) {
    const storage = multer.diskStorage({
      destination(req, file, cb) {
        cb(null, tmpStorage);
      },
      filename(req, file, cb) {
        cb(null, file.originalname);
      },
    });
    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 1045876,
      },
    });

    upload.single("picture")(req, res, async (err) => {
      const { path: tempName } = req.file;
      const newName = path.join(imagesPath, String(req.user._id)) + ".jpg";
      await fs.rename(tempName, newName); // saves new photo
      const image = await jimp.read(newName); // resizing a photo
      image.resize(250, 250);
      await image.writeAsync(newName);
    });
    try {
      const user = await Users.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { avatarURL: `/avatars/${req.user._id}.jpg` } },
        { new: true }
      );
      res.status(200).json({ avatarURL: user.avatarURL });
    } catch (err) {
      res.status(401).json({
        message: "Not authorized",
      });
    }
  },
  async verifyUserByToken(req, res) {
    try {
      const id = req.params.verificationToken;
      const user = await Users.findOneAndUpdate(
        { verificationToken: id },
        { $set: { verificationToken: null, verify: true } },
        { new: true }
      );
      if (!user) {
        throw Error;
      }
      console.log(user);
      res.status(200).json({ message: "Verification successful" });
    } catch (err) {
      res.status(404).json({ message: "User not found" });
    }
  },
  async resendVerifyMail(req, res) {
    const userEmail = req.body.email;
    if (!userEmail) {
      res.status(400).json({ message: "Missing required field email" });
    }
    const user = await Users.findOne({ email: req.body.email });
    const { email, verify, verificationToken } = user;
    if (verify) {
      res.status(400).json({ message: "Verification has already been passed" });
    }
    sendVerifyMail(email, verificationToken);
    res.status(200).json({ message: "Verification email sent" });
  },
};

module.exports = usersController;
