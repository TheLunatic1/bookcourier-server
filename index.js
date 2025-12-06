import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

import express from "express";
import cors from "cors";
import connectDB from "./src/db.js";
import "colors";

console.log("STRIPE KEY:", process.env.STRIPE_SECRET_KEY ? "LOADED" : "MISSING!!!");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

import userRoutes from "./src/routes/userRoutes.js";
import bookRoutes from "./src/routes/bookRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "BookCourier Server Running!",
    stripe: process.env.STRIPE_SECRET_KEY ? "Connected" : "Failed"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`.green.bold);
});

import orderRoutes from "./src/routes/orderRoutes.js";
app.use("/api/orders", orderRoutes);

import wishlistRoutes from "./src/routes/wishlistRoutes.js";
app.use("/api/wishlist", wishlistRoutes);