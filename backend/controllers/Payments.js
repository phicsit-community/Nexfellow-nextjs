// const { instance } = require("../config/razorpay")
// // const Course = require("../models/Course")
// const crypto = require("crypto")
// const User = require("../models/userModel")


// exports.capturePayment = async (req, res) => {

// //   const userId = req.user.id
//   let total_amount = 10
// try {
//     const cost=50000
//     const amount = cost; // Amount in paise
//     const currency = 'INR';
//     const receipt = 'receipt_' + crypto.randomBytes(5).toString('hex'); 
//     const order = await instance.orders.create({amount, currency, receipt});
//     res.json(order);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to create order' });
//   }
// }

// // verify the payment
// exports.verifyPayment = async (req, res) => {
//   const razorpay_order_id = req.body?.razorpay_order_id
//   const razorpay_payment_id = req.body?.razorpay_payment_id
//   const razorpay_signature = req.body?.razorpay_signature


//   const userId = req.userId;

//   if (
//     !razorpay_order_id ||
//     !razorpay_payment_id ||
//     !razorpay_signature ||
//     !userId
//   ) {
//     return res.status(200).json({ success: false, message: "Payment Failed" })
//   }

//   let body = razorpay_order_id + "|" + razorpay_payment_id

//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_SECRET)
//     .update(body.toString())
//     .digest("hex")

//   if (expectedSignature === razorpay_signature) {
//     console.log("Payment Verified")
//     // find user by and then update the subscription tier
//     // await User.findByIdAndUpdate

//     const subscription= await User.findByIdAndUpdate(
//       userId,
//       {
//         subscriptionTier: "bronze",
//       },
//       { new: true }

//     )
//     console.log(subscription);


//     return res.status(200).json({ success: true, message: "Payment Verified", subscription })

//   }


//   return res.status(200).json({ success: false, message: "Payment Failed" })
// }



const Razorpay = require('razorpay');
// const { v4: uuidv4 } = require('uuid');
const User = require('../models/userModel');
const crypto = require('crypto');
// const profileModel = require('../models/profileModel');
const ExpressError = require('../utils/ExpressError.js');
// const uploadOnCloudinary = require('../utils/cloudinary');
const MailSender = require('../utils/mailSender');
// const fs = require('fs');
// const path = require('path');
// const PDFDocument = require('pdfkit');
// const Invoice = require('../models/invoiceModel');
// const userPlanStatus = require('../models/userPlanStatus');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });
  
module.exports.createOrder = async (req, res) => {

    let {amount} = req.body;
    const user = await User.findById(req.userId);
    if(!user) {
        throw new ExpressError("User not found", 400);
    }


    if(!amount) {
        throw new ExpressError("Amount is required", 400);
    }
    
    const options = {
    //   amount: amount * 100, // amount in smallest currency unit
      amount: amount * 1, // amount in smallest currency unit
      currency: 'INR',
      receipt: uuidv4(),
    };

    const order = await razorpay.orders.create(options);    
    res.json({ order: order });
};


module.exports.verify = async (req, res) => {
  const { response, plan } = req.body;
  const userId = req.userId;
  const user = await User.findById(userId);
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);

  hmac.update(response.razorpay_order_id + "|" + response.razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === response.razorpay_signature) {
    
      user.subscriptionTier = plan.title;
    
      const sending = await MailSender(user.email, "Order Summary", 
      `<p>Dear ${user.name},</p>
      <p>Thank you for purchasing our ${plan.title} plan.</p>
      <p>Attached is your invoice for your records.</p>
      <p>Order Details:</p>
      <ul>
        <li>Order ID: ${response.razorpay_order_id}</li>
        <li>Payment ID: ${response.razorpay_payment_id}</li>
        <li>Plan: ${plan.title}</li>
        <li>Amount: ₹${plan.price}</li>
        <li>Date: ${new Date().toLocaleDateString()}</li>
      </ul>
      <p>Thank you for your purchase!</p>`);
      
      // Remove local invoice file after sending email

      res.status(200).send('Payment verified successfully.');
  } else {
      res.status(400).send('Payment verification failed.');
  }
};