import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  coverImage: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, default: "Fiction" },
  price: {type: Number, required: true, min: 0, default: 0},
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  addedByName: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Book", bookSchema);