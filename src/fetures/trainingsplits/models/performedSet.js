const { Schema } = require("mongoose");

const performedSetSchema = new Schema({
  weight: {
    type: Number,
    required: true,
  },
  reps: {
    type: Number,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: true,
  },
  notes: String,
});

module.exports = performedSetSchema;
