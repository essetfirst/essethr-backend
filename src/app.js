const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const routes = require("./routes");

const app = express();
const { resolve } = require("path");

// var corsOptions = {};
app.use(cors({ origin: "same-origin" }));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));
app.use(express.static(resolve(__dirname, "../public")));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Mount the API routes
app.use("/api/v1", routes);

module.exports = app;
