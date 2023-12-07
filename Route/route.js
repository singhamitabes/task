const express = require("express")
const router = express.Router()

const { createUser, changeUserStatus, verifyToken, getUserDistance, calculateUserDistance, getUserListingByWeek } = require("../Controller/controller")


router.route("/createUser").post(createUser)
router.route("/changeAllUserStatus").put(verifyToken, changeUserStatus)
router.route("/getUserDistance").get(calculateUserDistance, getUserDistance)
router.route("/getUserListing").get(getUserListingByWeek)

module.exports = router