import express from "express";
import Book from "../models/Book.js";
import { protect, librarianOnly, adminOnly } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";

const router = express.Router();


// GET my books - LIBRARIAN ONLY
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

// ADD BOOK - LIBRARIAN ONLY
router.post("/", protect, librarianOnly, async (req, res) => {
  const { title, author, coverImage, description, category, price } = req.body;

  try {
    const book = new Book({
      title,
      author,
      coverImage,
      description: description || "",
      category: category || "Fiction",
      price: Number(price),
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


// PUBLISH/UNPUBLISH BOOK - ADMIN ONLY
router.patch("/:id/publish", protect, adminOnly, async (req, res) => {
  const { isAvailable } = req.body;
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    book.isAvailable = isAvailable;
    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// DELETE BOOK: ADMIN CAN DELETE ANY, LIBRARIAN CAN DELETE THEIR OWN
router.delete("/:id", protect, async (req, res) => {
  try {
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Admin can delete any book
    if (req.user.role === "admin") {
      // Admin deletes book + all orders
      await Order.deleteMany({ book: bookId });
      await Book.findByIdAndDelete(bookId);
      return res.json({ message: "Book and all orders deleted (Admin)" });
    }

    // Librarian can only delete THEIR OWN books
    if (req.user.role === "librarian") {
      if (book.addedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only delete your own books" });
      }
      // Librarian deletes book + all orders
      await Order.deleteMany({ book: bookId });
      await Book.findByIdAndDelete(bookId);
      return res.json({ message: "Your book and its orders deleted" });
    }

    // Users can't delete
    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;