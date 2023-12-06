const express = require("express")
const router = express.Router()

const { createUser, changeUserStatus, verifyToken, getUserDistance, calculateUserDistance, getUserListingByWeek } = require("../Controller/controller")


router.route("/createUser").post(createUser)
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTcwNDY5Njg0ZDQ5OGU5MWU1Y2VlZGMiLCJpYXQiOjE3MDE4NTY5MTgsImV4cCI6MTcwMTk0MzMxOH0.Xh4StttXSDrIRo6xQwq4Xvynz0V3mwvFbltHIsVzaUA

router.route("/changeAllUserStatus").put(verifyToken, changeUserStatus)
router.route("/getUserDistance").post(calculateUserDistance, getUserDistance)
router.route("/getUserListing").post(getUserListingByWeek)

module.exports = router