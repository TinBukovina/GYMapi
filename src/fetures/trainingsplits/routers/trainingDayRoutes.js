const express = require("express");

const trainingDayController = require("../controllers/trainingDayController");

const router = express.Router();

router
  .route("/")
  .get(trainingDayController.getAllTrainingDays)
  .post(trainingDayController.createTrainingDay);
router
  .route("/:id")
  .get(trainingDayController.getTrainingDayWithId)
  .patch(trainingDayController.updateTrainingDay)
  .delete(trainingDayController.deleteTrainingDay);

module.exports = router;
