const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const exerciseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  repsPerSet: {
    type: String, // Can be "8-12" or a specific number
    required: true,
  },
  restTime: {
    type: Number, // Rest time in seconds
    default: 60,
  },
  notes: String,
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
