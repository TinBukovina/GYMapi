const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./fileUtils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./fetures/users/userRoutes");
const trainingSplitRouter = require("./fetures/trainingsplits/routers/trainingSplitRoutes");
const trainingDayRouter = require("./fetures/trainingsplits/routers/trainingDayRoutes");
const exercisesRouter = require("./fetures/trainingsplits/routers/exerciseRoutes");
const trainingInstanceRouter = require("./fetures/trainingsplits/routers/trainingInstancesRoutes");

const app = express();

// Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit request from user
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1h
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

// Body parser, enabeling reading req.body variable
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization agains XSS (malicious HTML code)
app.use(xss());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// Prevent parametre polution
app.use(
  hpp({
    whitelist: ["usernamev  "],
  }),
);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/trainingSplits", trainingSplitRouter);
app.use("/api/v1/trainingDays", trainingDayRouter);
app.use("/api/v1/exercises", exercisesRouter);
app.use("/api/v1/trainingInstance", trainingInstanceRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
