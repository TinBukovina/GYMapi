const express = require("express");

const userController = require("./userController");
const authController = require("../../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:resetToken", authController.resetPassword);

// Updating password for logged users
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword,
);

router.patch("/updateMe", authController.protect, userController.updateMe);
router.delete("/deleteMe", authController.protect, userController.deleteMe);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers,
  )
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    userController.createUser,
  );
router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getUserWithId,
  )
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    userController.updateUser,
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    userController.deleteUser,
  );

module.exports = router;
