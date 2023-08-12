const express = require("express");
const db = require("./config");
const routes = require("./routes/api/contacts");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use("/api/contacts", routes);

db.once("open", () => {
  app.listen(PORT, () => {
    console.log("Database connection successful");
  });
});
