import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  coverImage: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: "General" },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  addedByName: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Book", bookSchema);