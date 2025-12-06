import express from "express";
import Stripe from "stripe";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// HARD-CODED KEY
const stripe = new Stripe("sk_test_51SbRGvFG9nlrikEDG4TfjtoLtcxYy5NuFQ7Svv1J3G0l2XW1Mw38m8OAV6xh4lLJ8S6ww7phxkGaU2HvkKRrrVbI00PQxI4wvF");

router.post("/create-checkout-session", protect, async (req, res) => {
  const { bookId, bookTitle } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `http://localhost:5174/payment-success?bookId=${bookId}`,
      cancel_url: `http://localhost:5174/payment-cancel`,
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Delivery: ${bookTitle}`,
              description: "Book delivery charge",
            },
            unit_amount: 15000,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: req.user._id.toString(),
        bookId,
        bookTitle,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ message: "Payment failed" });
  }
});

export default router;