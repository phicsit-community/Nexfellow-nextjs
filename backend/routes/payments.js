const express = require("express")
const router = express.Router()
const paymentController = require("../controllers/Payments")
const { isClient } = require("../middleware")


router.route("/capturePayment")
    .post(isClient, paymentController.createOrder)

    
router.route("/verifyPayment")
    .post(isClient, paymentController.verify)


module.exports = router