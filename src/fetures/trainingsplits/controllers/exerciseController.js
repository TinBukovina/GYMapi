const APIQueryFeatures = require("../../../fileUtils/apiQueryFeatures");
const AppError = require("../../../fileUtils/appError");
const catchAsync = require("../../../fileUtils/catchAsync");
const Exercise = require("../models/exerciseModel");

const getAllExercises = catchAsync(async (req, res, next) => {
  const advancedQuery = new APIQueryFeatures(Exercise.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagginate();

  const allExercises = await advancedQuery.query;

  res.status(200).json({
    status: "success",
    numResults: allExercises.length,
    data: {
      exercises: allExercises,
    },
  });
});

const getExerciseWithId = catchAsync(async (req, res, next) => {
  const exercise = await Exercise.findById(req.params.id);

  if (!exercise)
    return next(new AppError("There is no exercise with that ID.", 404));

  res.status(200).json({
    status: "success",
    data: {
      exercise,
    },
  });
});

const createExercise = catchAsync(async (req, res, next) => {
  const createdExercise = await Exercise.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      exercise: createdExercise,
    },
  });
});

const updateExercise = catchAsync(async (req, res, next) => {
  const updatedExercise = await Exercise.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedExercise)
    return next(new AppError("There is no exercise with that ID.", 404));

  res.status(200).json({
    status: "success",
    data: {
      exercise: updatedExercise,
    },
  });
});

const deleteExercise = catchAsync(async (req, res, next) => {
  const deletedExercise = await Exercise.findByIdAndDelete(req.params.id);

  if (!deletedExercise)
    return next(new AppError("There is no exercise with that ID.", 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  getAllExercises,
  getExerciseWithId,
  createExercise,
  updateExercise,
  deleteExercise,
};
