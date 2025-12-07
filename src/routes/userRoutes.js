import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";

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

// Request to become librarian - PROTECTED
router.post("/request-librarian", protect, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "user") {
      return res.status(400).json({ message: "Already have elevated role" });
    }
    user.librarianRequest = true;
    await user.save();
    res.json({ message: "Librarian request sent!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE PROFILE - PROTECTED
router.patch("/profile", protect, async (req, res) => {
  const { name, photoURL } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (photoURL) user.photoURL = photoURL;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      role: user.role,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



//GOOGLE LOGIN ROUTE
router.post("/google-login", async (req, res) => {
  const { email, name, photoURL } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        photoURL,
        role: "user",
        password: "google-auth-" + Date.now(),
      });
      await user.save();
    } else {
      // UPDATE PHOTO IF CHANGED
      if (photoURL && user.photoURL !== photoURL) {
        user.photoURL = photoURL;
        await user.save();
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      role: user.role,
    });
  } catch (err) {
    console.error("Google login server error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;