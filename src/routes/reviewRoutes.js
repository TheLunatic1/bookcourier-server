
import express from "express";
import Book from "../models/Book.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ADD REVIEW TO BOOK
router.post("/:bookId", protect, async (req, res) => {
  const { rating, comment } = req.body;
  const bookId = req.params.bookId;

  try {
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Prevent duplicate reviews
    const alreadyReviewed = book.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You already reviewed this book" });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    book.reviews.push(review);
    book.reviewCount = book.reviews.length;
    book.averageRating =
      book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviewCount;

    await book.save();

    res.status(201).json({ message: "Review added successfully" });
  } catch (err) {
    console.error("Review error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;