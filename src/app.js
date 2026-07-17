const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");

const routes = require("./routes.js");
const sanitizeInput = require("./middlewares/sanitize");
const csrfProtection = require("./middlewares/csrfProtection");
const { globalRateLimiter } = require("./middlewares/rateLimiter");
const { getCorsOrigins, isProduction } = require("./config/env");
const logger = require("./lib/logger");

const app = express();

app.use(helmet());

for (const dir of ["uploads/documents", "uploads/employees", "uploads/attendance"]) {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
}

const corsOrigins = getCorsOrigins();
if (isProduction()) {
  app.use(
    cors({
      origin: corsOrigins,
      credentials: false,
    }),
  );
} else if (corsOrigins?.length) {
  app.use(
    cors({
      origin: corsOrigins,
      credentials: false,
    }),
  );
} else {
  app.use(cors());
}

const jsonLimit = process.env.REQUEST_JSON_LIMIT || "1mb";
const urlencodedLimit = process.env.REQUEST_URLENCODED_LIMIT || "1mb";

app.use(express.urlencoded({ extended: false, limit: urlencodedLimit }));
app.use(express.json({ limit: jsonLimit }));
app.use(sanitizeInput);
app.use("/api/v1", csrfProtection);

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use("/api/v1", globalRateLimiter);
app.use("/api/v1", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  next();
});

app.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

const openApiSpec = require("./docs/openapi");
app.get("/api/docs/openapi.json", (req, res) => {
  res.json(openApiSpec);
});

app.use("/api/v1", routes);
app.use("/api/v2", routes);

const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

module.exports = app;
