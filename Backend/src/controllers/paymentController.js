const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/userModel");

// Lazy-load Razorpay instance from environment variables
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing from environment variables.");
  }

  return new Razorpay({
    key_id,
    key_secret
  });
};

// ================= 1. CREATE PAYMENT ORDER =================
// POST /api/payments/create-order or POST /api/create-order
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, plan = "premium" } = req.body;

    // Default to ₹500 (50000 paise) if not passed
    const parsedAmount = amount ? parseInt(amount, 10) : 50000;

    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 100) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required (in paise). Minimum amount is 100 paise (₹1.00)."
      });
    }

    const razorpay = getRazorpayInstance();

    const options = {
      amount: parsedAmount,
      currency: currency.toUpperCase(),
      receipt: receipt || `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: {
        userId: req.user?.id ? req.user.id.toString() : "guest",
        plan: plan,
        platform: "medikto_mobile_app"
      }
    };

    const order = await razorpay.orders.create(options);

    return res.status(201).json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });

  } catch (err) {
    console.error("RAZORPAY CREATE ORDER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: err.message
    });
  }
};

// ================= 2. VERIFY PAYMENT SIGNATURE & ACTIVATE SUBSCRIPTION =================
// POST /api/payments/verify-payment or POST /api/verify-payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      paymentId,
      signature,
      plan = "premium"
    } = req.body;

    const actualOrderId = razorpay_order_id || orderId;
    const actualPaymentId = razorpay_payment_id || paymentId;
    const actualSignature = razorpay_signature || signature;

    if (!actualOrderId || !actualPaymentId || !actualSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification parameters (order_id, payment_id, signature)"
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay key secret not configured on server"
      });
    }

    // Generate HMAC-SHA256 signature
    const body = `${actualOrderId}|${actualPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = (expectedSignature === actualSignature);

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Signature mismatch. Transaction not authorized."
      });
    }

    // Update User subscription in MongoDB upon successful payment
    if (req.user?.id) {
      const user = await User.findById(req.user.id);
      if (user) {
        const now = new Date();
        const subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days active

        user.subscription = plan;
        user.subscriptionDetails = {
          plan: plan,
          status: "active",
          subscriptionStart: now,
          subscriptionEnd: subscriptionEnd,
          trialUsed: user.subscriptionDetails?.trialUsed || false
        };

        await user.save();

        return res.status(200).json({
          success: true,
          message: `Payment verified! ${plan.toUpperCase()} subscription activated successfully.`,
          order_id: actualOrderId,
          payment_id: actualPaymentId,
          subscription: {
            plan: user.subscription,
            status: user.subscriptionDetails.status,
            subscriptionStart: user.subscriptionDetails.subscriptionStart,
            subscriptionEnd: user.subscriptionDetails.subscriptionEnd
          }
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order_id: actualOrderId,
      payment_id: actualPaymentId
    });

  } catch (err) {
    console.error("RAZORPAY VERIFY PAYMENT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: err.message
    });
  }
};

// ================= 3. RAZORPAY WEBHOOK =================
// POST /api/payments/webhook
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!signature || !secret) {
      return res.status(400).json({ status: "invalid_signature" });
    }

    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ status: "signature_mismatch" });
    }

    const event = req.body.event;
    console.log("Razorpay Webhook Event Received:", event);

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = req.body.payload?.payment?.entity;
      console.log(`Payment confirmed for order: ${paymentEntity?.order_id}, payment: ${paymentEntity?.id}`);
    }

    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Webhook processing error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
