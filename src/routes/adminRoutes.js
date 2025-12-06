import express from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all users - ADMIN ONLY
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all librarian requests - ADMIN ONLY
router.get("/librarian-requests", protect, adminOnly, async (req, res) => {
  try {
    const requests = await User.find({ librarianRequest: true, role: "user" });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve librarian - ADMIN ONLY
router.patch("/make-librarian/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "librarian";
    user.librarianRequest = false;
    await user.save();

    res.json({ message: "User is now a librarian!", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject librarian request - ADMIN ONLY
router.patch("/reject-librarian/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.librarianRequest = false;
    await user.save();

    res.json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;