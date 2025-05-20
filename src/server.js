const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log(err);

  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log("DB connection successfuly!");
});

const port = 3000;
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`App running on port ${port}`);
});

// Catches every unhandled error created in our app
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);

  console.log("UNHANDLER REJECTION! Shutting down...");
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
