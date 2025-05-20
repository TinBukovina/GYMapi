const APIQueryFeatures = require("../../../fileUtils/apiQueryFeatures");
const AppError = require("../../../fileUtils/appError");
const catchAsync = require("../../../fileUtils/catchAsync");
const TrainingInstance = require("../models/trainingInstanceModel");

const getAllTrainingInstances = catchAsync(async (req, res, next) => {
  const advancedQuery = new APIQueryFeatures(TrainingInstance.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagginate();

  const allTrainingInstances = await advancedQuery.query;

  res.status(200).json({
    status: "success",
    numResults: allTrainingInstances.length,
    data: {
      trainingInstances: allTrainingInstances,
    },
  });
});

const getTrainingInstanceWithId = catchAsync(async (req, res, next) => {
  const trainingInstance = await TrainingInstance.findById(req.params.id);

  if (!trainingInstance)
    return next(
      new AppError("There is no training instance with that ID.", 404),
    );

  res.status(200).json({
    status: "success",
    data: {
      trainingInstance,
    },
  });
});

const createTrainingInstance = catchAsync(async (req, res, next) => {
  const newTrainingInstance = await TrainingInstance.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      trainingDayInstance: newTrainingInstance,
    },
  });
});

const updateTrainingInsance = catchAsync(async (req, res, next) => {
  const updatedTrainingInstance = await TrainingInstance.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedTrainingInstance)
    return next(
      new AppError("There is no training instance with that ID.", 404),
    );

  res.status(201).json({
    status: "success",
    data: {
      trainingInstance: updatedTrainingInstance,
    },
  });
});

const deleteTrainingInstance = catchAsync(async (req, res, next) => {
  const deletedTrainingInstance = await TrainingInstance.findByIdAndDelete(
    req.params.id,
  );

  if (!deletedTrainingInstance)
    return next(
      new AppError("There is no training instance with that ID.", 404),
    );

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  getAllTrainingInstances,
  getTrainingInstanceWithId,
  createTrainingInstance,
  updateTrainingInsance,
  deleteTrainingInstance,
};
