const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const performedExerciseSchema = require("./performedExercise");

const trainingInstanceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  trainingDay: {
    type: Schema.Types.ObjectId,
    ref: "TrainingDay",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  exercises: [performedExerciseSchema],
  isCompleted: {
    type: Boolean,
    default: false,
  },
  notes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
});

const TrainingInstance = mongoose.model(
  "TrainingInstance",
  trainingInstanceSchema,
);

module.exports = TrainingInstance;
