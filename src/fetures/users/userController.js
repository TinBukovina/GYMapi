const User = require("./userModel");
const APIQueryFeatures = require("../../fileUtils/apiQueryFeatures");
const catchAsync = require("../../fileUtils/catchAsync");
const AppError = require("../../fileUtils/appError");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

const getAllUsers = catchAsync(async (req, res, next) => {
  const advancedQuery = new APIQueryFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagginate();
  const allUsers = await advancedQuery.query;

  res.status(200).json({
    status: "success",
    numResults: allUsers.length,
    data: {
      users: allUsers,
    },
  });
});

const getUserWithId = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(201).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);

  if (!deletedUser) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  // Create error if user POSTs password data
  if (req.body.password) {
    return next(
      new AppError(
        "This rout is not for password updates. Plase use /updateMyPassword",
        400,
      ),
    );
  }

  // Update the document
  // Filter out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "username", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

/* const getUserStats = async (req, res, next) => {
  // Ova funkcija je za implementiranje aggragatiom pipeline, što bi bio ekvivalent upitima unutar sql, za postizanje specifičnih podataka preko kompleksnih upita. Za korisnike mi to trenutno ne treba tako da neću to implementirati.
}; */

module.exports = {
  getAllUsers,
  getUserWithId,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
};
