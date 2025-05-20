const APIQueryFeatures = require("../../../fileUtils/apiQueryFeatures");
const AppError = require("../../../fileUtils/appError");
const catchAsync = require("../../../fileUtils/catchAsync");
const TrainingDay = require("../models/trainingDayModel");

const getAllTrainingDays = catchAsync(async (req, res, next) => {
  const advancedQuery = new APIQueryFeatures(TrainingDay.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagginate();

  const allTrainingDays = await advancedQuery.query;

  res.status(200).json({
    status: "success",
    numResults: allTrainingDays.length,
    data: {
      trainingDays: allTrainingDays,
    },
  });
});

const getTrainingDayWithId = catchAsync(async (req, res, next) => {
  const trainingDay = await TrainingDay.findById(req.params.id);

  if (!trainingDay)
    return next(new AppError("There is no training day with that ID.", 404));

  res.status(200).json({
    status: "success",
    data: {
      trainingDay,
    },
  });
});

const createTrainingDay = catchAsync(async (req, res, next) => {
  const createdTrainingDay = await TrainingDay.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      trainingDay: createdTrainingDay,
    },
  });
});

const updateTrainingDay = catchAsync(async (req, res, next) => {
  const updatedTrainingDay = await TrainingDay.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updateTrainingDay)
    return next(new AppError("There is no training day with that ID.", 404));

  res.status(201).json({
    status: "success",
    data: {
      trainingDay: updatedTrainingDay,
    },
  });
});

const deleteTrainingDay = catchAsync(async (req, res, next) => {
  const deletedTrainingDay = await TrainingDay.findByIdAndDelete(req.params.id);

  if (!deletedTrainingDay)
    return next(new AppError("This trainind day with that ID doesn't exist!"));

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  createTrainingDay,
  getTrainingDayWithId,
  getAllTrainingDays,
  updateTrainingDay,
  deleteTrainingDay,
};
