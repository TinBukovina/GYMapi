const APIQueryFeatures = require("../../../fileUtils/apiQueryFeatures");
const AppError = require("../../../fileUtils/appError");
const catchAsync = require("../../../fileUtils/catchAsync");
const TrainingSplit = require("../models/trainingSplitModel");

/* 
const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const path = `${__dirname}/trainingSplitData.json`;
const jsonString = await readFileAsync(path, "utf8");
const data = JSON.parse(jsonString); 
*/

const getAllTrainingSplits = catchAsync(async (req, res, next) => {
  const advancedQuery = new APIQueryFeatures(TrainingSplit.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagginate();

  const allTrainingSplits = await advancedQuery.query;

  res.status(200).json({
    status: "success",
    numResults: allTrainingSplits.length,
    data: {
      trainingSplits: allTrainingSplits,
    },
  });
});

const getTrainingSplitById = catchAsync(async (req, res, next) => {
  const trainingSplit = await TrainingSplit.findById(req.params.id);

  if (!trainingSplit)
    return next(new AppError("There is no training split with that ID.", 404));

  res.status(200).json({
    status: "success",
    data: {
      trainingSplit,
    },
  });
});

const createTrainingSplit = catchAsync(async (req, res, next) => {
  const newTrainingSplit = await TrainingSplit.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      trainingSplit: newTrainingSplit,
    },
  });
});

const updateTrainingSplit = catchAsync(async (req, res, next) => {
  const updatedTrainingSplit = await TrainingSplit.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedTrainingSplit)
    return next(new AppError("No training split found with that ID", 404));

  res.status(201).json({
    status: "success",
    data: {
      trainingSplit: updatedTrainingSplit,
    },
  });
});

const deleteTrainingSplit = catchAsync(async (req, res, next) => {
  const deletedUser = await TrainingSplit.findByIdAndDelete(req.params.id);

  if (!deletedUser)
    return next(new AppError("The training split doesn't exits!", 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  getAllTrainingSplits,
  getTrainingSplitById,
  createTrainingSplit,
  updateTrainingSplit,
  deleteTrainingSplit,
};
