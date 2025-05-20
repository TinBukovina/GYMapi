const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const trainingSplitSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  weeklyFrequency: {
    type: Number,
    required: true,
    min: 1,
    max: 7,
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TrainingSplit = mongoose.model("TrainingSplit", trainingSplitSchema);

module.exports = TrainingSplit;
