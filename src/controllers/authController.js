const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");

const User = require("../fetures/users/userModel");
const catchAsync = require("../fileUtils/catchAsync");
const AppError = require("../fileUtils/appError");
const sendEmail = require("../fileUtils/email");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookeiOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000, // 1h
    ),
    secure: true,
    httpOnly: true,
  };

  // This makes so that when we are only in production that sey thta cookies needs to be send through https, and when i development we can still use cookies
  if (process.env.NODE_ENV === "production") cookeiOptions.secure = true;

  res.cookie("jwt", token, cookeiOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const signup = catchAsync(async (req, res, next) => {
  const userData = { ...req.body };

  const restrictedFields = [
    "role",
    "isActive",
    "isVerified",
    "verificationToken",
    "verificationTokenExpiry",
    "resetPasswordToken",
    "resetPasswordExpires",
    "failedLoginAttempts",
    "accountLockedUntil",
    "lastLogin",
    "lastActive",
    "registeredAt",
    "registrationIP",
    "slug",
  ];
  restrictedFields.forEach((field) => delete userData[field]);

  const newUser = await User.create(userData);

  createAndSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please privde email and password!", 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorect email or password"), 401); // 401 = unothorized access
  }

  // 3) If everthing is okey, send token to client
  createAndSendToken(user, 201, res);
});

const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;

  const { authorization: authorizationHeader } = req.headers;

  if (authorizationHeader && authorizationHeader.startsWith("Bearer")) {
    token = authorizationHeader.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access!", 401),
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const checkedUser = await User.findById(decoded.id);

  if (!checkedUser) {
    return next(
      new AppError("The user belonging to this token doesnt exits!", 401),
    );
  }

  // 4) Check if user changed password after JWT was issued
  if (checkedUser.didUserChangePassword(decoded.iat)) {
    return next(
      new AppError("User recently changed pasword! Please log in again.", 401),
    );
  }

  // We can use req object to pass data from middleware to middleware in order to have access to that data in every middleware
  req.user = checkedUser;
  next();
});

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform the action.", 403), // Forbidden access code
      );
    }
    next();
  };

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with that email address.", 404));
  }

  // 2) Generate the random reset
  const resetToken = user.generatePasswordResetToekn();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password to ${resetURL}.\n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (10min expire)",
      message,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending email. Try again later!", 500),
    );
  }

  res.status(200).json({
    status: "success",
    message: "Token send to email",
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired!", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  // 3) Update changedPasswordAt propert for the user (.pre function)
  await user.save();

  // 4) Log the user in, sent JWT
  createAndSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  await user.save();

  // 4) Log user in, send JWT
  createAndSendToken(user, 200, res);
});

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
