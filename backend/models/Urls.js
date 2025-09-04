import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  shortcode: { type: String, unique: true, required: true },
  originalUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiry: { type: Date, required: true }
});

export default mongoose.model("Url", urlSchema);