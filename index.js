import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

import express from "express";
import cors from "cors";
import connectDB from "./src/db.js";
import "colors";

console.log("STRIPE KEY:" .green, process.env.STRIPE_SECRET_KEY ? "LOADED".green : "MISSING!!!" .red);

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      "https://bookcourier-client.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174"
    ];
    
    // Bug fix: allow requests with no origin
    if (!origin || allowed.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
}));
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
    message: "BookCourier Server Running!...SERVER RUNNING!...MONGODB CONNECTED!...",
    stripe: process.env.STRIPE_SECRET_KEY ? "Connected" : "Failed"
  });
});

app.listen(PORT, () => {
  console.log(`SERVER RUNNING...`.green.bold);
});

import orderRoutes from "./src/routes/orderRoutes.js";
app.use("/api/orders", orderRoutes);

import wishlistRoutes from "./src/routes/wishlistRoutes.js";
app.use("/api/wishlist", wishlistRoutes);

import reviewRoutes from "./src/routes/reviewRoutes.js";
app.use("/api/reviews", reviewRoutes);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://bookcourier-client.vercel.app",
  "https://bookcourier.netlify.app",
  "https://bookcourier-client.vercel.app/",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

import errorHandler from "./src/middleware/errorMiddleware.js";

app.use(errorHandler);