import express from "express";
import Book from "../models/Book.js";
import { protect, librarianOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET my books - LIBRARIAN ONLY (must be first!)
router.get("/my", protect, librarianOnly, async (req, res) => {
  try {
    const books = await Book.find({ addedBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error("GET my books error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Toggle availability - LIBRARIAN ONLY
router.patch("/:id/availability", protect, librarianOnly, async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, addedBy: req.user._id });
    if (!book) {
      return res.status(404).json({ message: "Book not found or not yours" });
    }

    book.isAvailable = !book.isAvailable;
    await book.save();

    res.json({ 
      message: "Availability updated", 
      isAvailable: book.isAvailable 
    });
  } catch (err) {
    console.error("Toggle availability error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD book - LIBRARIAN ONLY
router.post("/", protect, librarianOnly, async (req, res) => {
  try {
    const { title, author, coverImage, description, category } = req.body;

    const book = new Book({
      title,
      author,
      coverImage,
      description: description || "",
      category: category || "Fiction",
      addedBy: req.user._id,
      addedByName: req.user.name,
      isAvailable: true,
    });

    const savedBook = await book.save();
    const populatedBook = await Book.findById(savedBook._id).populate("addedBy", "name");
    
    res.status(201).json(populatedBook);
  } catch (err) {
    console.error("ADD book error:", err);
    res.status(400).json({ message: err.message });
  }
});

// GET all books (public)
router.get("/", async (req, res) => {
  try {
    const books = await Book.find()
      .populate("addedBy", "name")
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error("GET all books error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single book by ID
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("addedBy", "name");
    
    if (!book) return res.status(404).json({ message: "Book not found" });
    
    res.json(book);
  } catch (err) {
    console.error("GET book error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE book
router.delete("/:id", protect, librarianOnly, async (req, res) => {
  try {
    const result = await Book.deleteOne({
      _id: req.params.id,
      addedBy: req.user._id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Book not found or not authorized" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error("DELETE book error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;