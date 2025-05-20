const { Schema } = require("mongoose");

const performedSetSchema = require("./performedSet");

const performedExerciseSchema = new Schema({
  exercise: {
    type: Schema.Types.ObjectId,
    ref: "Exercise",
    required: true,
  },
  name: String, // Copy of the name for denormalization
  plannedSets: Number,
  plannedReps: String,
  actualSets: [performedSetSchema],
  isCompleted: {
    type: Boolean,
    default: false,
  },
  notes: String,
});

module.exports = performedExerciseSchema;
