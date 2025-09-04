import mongoose from "mongoose";

const clickSchema = new mongoose.Schema({
  shortcode: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  referrer: { type: String },
  location: { type: String } // store coarse location (country/city)
});

export default mongoose.model("Click", clickSchema);