import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, photoURL });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      role: user.role,
      librarianRequest: user.librarianRequest,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
        librarianRequest: user.librarianRequest,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Request to become librarian
router.post("/request-librarian", async (req, res) => {
  try {
    // We'll protect this with auth middleware later
    const user = await User.findById(req.body.userId || req.user?.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "user") {
      return res.status(400).json({ message: "Already elevated role" });
    }

    user.librarianRequest = true;
    await user.save();
    res.json({ message: "Request sent to admin!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all requests
router.get("/librarian-requests", async (req, res) => {
  try {
    const requests = await User.find({ librarianRequest: true, role: "user" });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Approve librarian
router.patch("/make-librarian/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "librarian";
    user.librarianRequest = false;
    await user.save();

    res.json({ message: "User is now a librarian!", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;