import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/db.js";
import "colors";
import userRoutes from "./src/routes/userRoutes.js";
import errorHandler from "./src/middleware/errorMiddleware.js";
import bookRoutes from "./src/routes/bookRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import wishlistRoutes from "./src/routes/wishlistRoutes.js";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();



app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "BookCourier Server is running!",
    status: "connected to MongoDB Atlas"
  });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`.green.bold);
});

app.use(errorHandler);
app.use("/api/books", bookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);