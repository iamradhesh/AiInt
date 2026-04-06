//import Razorpay from "razorpay";
import razorpay from "../services/Razorpay.service.js";
import Payment from "../models/payment.model.js";
import crypto from "crypto";
import User from "../models/user.model.js";

export const createOrder = async (req, res) => {
  try {
    const { planId, amount, credits } = req.body;
    // Create an order using Razorpay
    if (!planId || !amount || !credits) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existingPending = await Payment.findOne({
      userId: req.userId,
      planId,
      status: "created",
    });

    if (existingPending) {
      return res.status(400).json({
        message: "Payment already in progress",
      });
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto-capture the payment
    };

    const order = await razorpay.orders.create(options);
    console.log(order);
    await Payment.create({
      userId: req.userId,
      planId,
      amount,
      credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error creating order" });
    console.log("Failed to create order", error);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.status === "paid") {
      return res.status(400).json({ message: "Payment already verified" });
    }
    //Update payment record
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = "paid";
    await payment.save();

    //Add Credits to User Account
    const updatedUser = await User.findByIdAndUpdate(
      payment.userId,
      { $inc: { credits: payment.credits } },
      { new: true },
    );
    res.status(200).json({
      Success: true,
      message: "Payment verified successfully",
      user: updatedUser,
    });
    console.log("Payment verified successfully");
  } catch (error) {
    res.status(500).json({ message: "Error verifying payment" });
    console.log("Failed to verify payment", error);
  }
};
