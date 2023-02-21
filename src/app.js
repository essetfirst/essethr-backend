const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const routes = require("./routes");

const app = express();
const path = require("path");

require("dotenv").config();

// app.use(express.static("public"));
app.use("/", express.static(__dirname + "/public"));
// var corsOptions = {};
app.use(cors({ origin: "same-origin" }));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));
// app.use(express.static(path.resolve("../uploads")));
// app.use(express.static(path.join(__dirname,"public")));
// app.use(express.static("src/public"));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
  
  // app.use(express.static("public"));
// Mount the API routes
app.use("/api/v1", routes);

module.exports = app;
