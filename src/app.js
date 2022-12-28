const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const routes = require("./routes");

const app = express();

// var corsOptions = {};

app.use(cors({ origin: "same-origin" }));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("dist"));
app.use(express.static("static"));
app.use(express.static("public"));

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

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
app.get("/*", (req, res) => {
  res.sendFile("index.html", { root: "./public/" });
});

module.exports = app;
