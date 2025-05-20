const express = require("express");

const trainingInstanceController = require("../controllers/trainingInstanceController");

const router = express.Router();

router
  .route("/")
  .get(trainingInstanceController.getAllTrainingInstances)
  .post(trainingInstanceController.createTrainingInstance);
router
  .route("/:id")
  .get(trainingInstanceController.getTrainingInstanceWithId)
  .patch(trainingInstanceController.updateTrainingInsance)
  .delete(trainingInstanceController.deleteTrainingInstance);

module.exports = router;
