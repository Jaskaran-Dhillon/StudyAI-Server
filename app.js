require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: 'uploads/' });
const user = require("./routes/user");
const aiService = require("./routes/ai-service");

const bodyParser = require("body-parser");
const sequelize = require("./util/database");

//NOTE: Run with cmd terminal to use nodemon
const app = express();
app.options("*", cors());
app.use(
  cors({
    allowedHeaders: ["authorization", "Content-Type"], 
    exposedHeaders: ["authorization"], 
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
  })
);

sequelize
  .sync()
  .then((result) => {
    app.listen(parseInt(process.env.PORT));
  })
  .catch((e) => {
    console.log("Failed to sync", e);
  });


app.use(bodyParser.json());

app.use("/user", user);
app.use("/aiService", upload.single('file'), aiService)

app.get("*", (req, res) => {
  res.status(404).send({ error: "Invalid path" });
});
