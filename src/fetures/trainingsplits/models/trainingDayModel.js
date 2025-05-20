const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const trainingDaySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  trainingSplit: {
    type: Schema.Types.ObjectId,
    ref: "TrainingSplit",
    required: true,
  },
  exercises: [
    {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
    },
  ],
  dayOrder: {
    type: Number, // Position in the split (1, 2, 3, etc.)
    required: true,
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TrainingDay = mongoose.model("TrainingDay", trainingDaySchema);

module.exports = TrainingDay;
