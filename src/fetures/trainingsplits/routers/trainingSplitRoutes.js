const express = require("express");

const trainingSplitController = require("../controllers/trainingSplitController");

const router = express.Router();

router
  .route("/")
  .get(trainingSplitController.getAllTrainingSplits)
  .post(trainingSplitController.createTrainingSplit);
router
  .route("/:id")
  .get(trainingSplitController.getTrainingSplitById)
  .patch(trainingSplitController.updateTrainingSplit)
  .delete(trainingSplitController.deleteTrainingSplit);

module.exports = router;
