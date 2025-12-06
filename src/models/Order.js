import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  bookTitle: String,
  bookCover: String,
  deliveryAddress: String,
  phone: String,
  note: String,
  amount: {
    type: Number,
    default: 15000, // 150 taka
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  paymentId: String, // Stripe payment ID
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);