import express from "express";
import Wishlist from "../models/Wishlist.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET user's wishlist
router.get("/", protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("books");
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, books: [] });
    }
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD to wishlist
router.post("/", protect, async (req, res) => {
  const { bookId } = req.body;
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, books: [bookId] });
    } else if (!wishlist.books.includes(bookId)) {
      wishlist.books.push(bookId);
    }
    await wishlist.save();
    await wishlist.populate("books");
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// REMOVE from wishlist
router.delete("/:bookId", protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.books = wishlist.books.filter(b => b.toString() !== req.params.bookId);
      await wishlist.save();
    }
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;