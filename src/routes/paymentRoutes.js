import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// HARD-CODED KEY HAVE TO BE REPLACED WITH ENV VARIABLE IN PRODUCTION
const stripe = new Stripe("sk_test_51SbRGvFG9nlrikEDG4TfjtoLtcxYy5NuFQ7Svv1J3G0l2XW1Mw38m8OAV6xh4lLJ8S6ww7phxkGaU2HvkKRrrVbI00PQxI4wvF");

router.post("/create-checkout-session", protect, async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findById(orderId).populate("book", "title");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only allow payment if pending
    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment-success?orderId=${orderId}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Order #${orderId.slice(-6)} - ${order.book.title}`,
              description: "Book + Delivery Charge",
            },
            unit_amount: order.totalAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId,
        userId: req.user._id.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ message: "Payment failed" });
  }
});

export default router;