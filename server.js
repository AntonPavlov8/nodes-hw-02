const express = require("express");
const session = require("express-session");
const db = require("./config");
const path = require("path");
const contactsRouter = require("./routes/api/contactsRouter");
const usersRouter = require("./routes/api/usersRouter");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;

const publicPath = path.join(__dirname, "public");

const sess = {
  secret: process.env.JWT_SECRET,
  cookie: {
    maxAge: 300000,
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  },
  resave: false,
  saveUninitialized: true,
};

app.use(session(sess));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(express.static(publicPath));
app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);

db.once("open", () => {
  app.listen(PORT, () => {
    console.log("Database connection successful");
  });
});
