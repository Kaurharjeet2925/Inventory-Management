const express = require("express");
const router = express.Router();

const {createLocation, getAllLocations, updateLocation, deleteLocation} = require("../controller/location.controller");

router.post("/locations/create", createLocation);
router.get("/locations", getAllLocations);
router.put("/locations/:id", updateLocation);
router.delete("/locations/:id", deleteLocation);
module.exports = router;    