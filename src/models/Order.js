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
  price: {
    type: Number,
    required: true,
  },
  deliveryAddress: String,
  phone: String,
  note: String,
  amount: {
    type: Number,
    default: 15000,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid",
  },
  paymentId: String,
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);