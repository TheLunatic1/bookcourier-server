import express from "express";
import Book from "../models/Book.js";

const router = express.Router();

// Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new book (librarian only)
router.post("/", async (req, res) => {
  const { title, author, coverImage, description, category, addedBy, addedByName } = req.body;
  const book = new Book({ title, author, coverImage, description, category, addedBy, addedByName });
  try {
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;