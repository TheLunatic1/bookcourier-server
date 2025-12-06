import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get librarian requests
router.get("/librarian-requests", async (req, res) => {
  try {
    const requests = await User.find({ librarianRequest: true, role: "user" });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Make user librarian
router.patch("/make-librarian/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "librarian";
    user.librarianRequest = false;
    await user.save();

    res.json({ message: "Librarian approved", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;