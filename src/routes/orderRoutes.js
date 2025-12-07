import express from "express";
import Order from "../models/Order.js";
import Book from "../models/Book.js";
import { protect, librarianOnly, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE ORDER AFTER PAYMENT (USER ONLY)
router.post("/", protect, async (req, res) => {
  const { bookId, phone, address } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const totalAmount = book.price * 100 + 15000; // ← FIX: price * 100 + delivery (15000 cents)

    const order = new Order({
      user: req.user._id,
      book: bookId,
      bookTitle: book.title,
      bookCover: book.coverImage,
      price: book.price,
      totalAmount,
      deliveryAddress: address,
      phone,
      status: "pending",
      paymentStatus: "unpaid",
    });

    const savedOrder = await order.save();
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("book", "title coverImage")
      .populate("user", "name");

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error("Order create error:", err);
    res.status(500).json({ message: "Order failed" });
  }
});

// GET MY ORDERS (USER)
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("book", "title coverImage author")
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL ORDERS — LOGIC BASED ON ROLE
router.get("/all", protect, async (req, res) => {
  try {
    let orders;

    if (req.user.role === "admin") {
      // ADMIN sees ALL orders
      orders = await Order.find()
        .populate("user", "name email phone")
        .populate("book", "title author coverImage addedByName")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "librarian") {
      // LIBRARIAN sees only orders for books THEY added
      const librarianBooks = await Book.find({ addedBy: req.user._id }).select("_id");
      const bookIds = librarianBooks.map(b => b._id);

      orders = await Order.find({ book: { $in: bookIds } })
        .populate("user", "name email phone")
        .populate("book", "title author coverImage")
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(orders);
  } catch (err) {
    console.error("Get all orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE ORDER STATUS — LIBRARIAN (only their books) OR ADMIN
router.patch("/:id/status", protect, async (req, res) => {
  const { status } = req.body;

  if (!["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const order = await Order.findById(req.params.id).populate("book");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check permission
    if (req.user.role === "librarian") {
      if (order.book.addedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not your book" });
      }
    }
    // Admin can update any

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name")
      .populate("book", "title");

    res.json(updatedOrder);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;