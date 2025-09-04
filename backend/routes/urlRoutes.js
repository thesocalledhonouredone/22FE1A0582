import express from "express";
import crypto from "crypto";
import dayjs from "dayjs";
import geoip from "geoip-lite";
import Url from "../models/Urls.js";
import Click from "../models/Click.js";

const router = express.Router();

// helper function to generate random shortcode if shortcode not provided 
function generateRandomShortcode() {
  return crypto.randomBytes(3).toString("hex");
}

// POST /shorturls – create short URL
router.post("/shorturls", async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;

    if (!url) return res.status(400).json({ message: "URL is required" });

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    const validityInMinutes = validity ? parseInt(validity) : 30;
    if (isNaN(validityInMinutes) || validityInMinutes <= 0) {
      return res.status(400).json({ message: "Validity must be a positive integer (minutes)" });
    }

    const expiryDate = dayjs().add(validityInMinutes, "minute").toDate();
    let finalShortcode = (shortcode || generateRandomShortcode()).toLowerCase();

    const exists = await Url.findOne({ shortcode: finalShortcode });
    if (exists) {
      return res.status(400).json({ message: "Shortcode already exists. Try another one." });
    }

    const newUrl = await Url.create({
      shortcode: finalShortcode,
      originalUrl: url,
      expiry: expiryDate,
    });

    res.status(201).json({
      shortLink: `${req.app.locals.baseUrl}/${newUrl.shortcode}`,
      expiry: newUrl.expiry,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /:shortcode – redirect + track click
router.get("/:shortcode", async (req, res) => {
  try {
    const { shortcode } = req.params;
    const entry = await Url.findOne({ shortcode });
    if (!entry) return res.status(404).json({ message: "Shortcode not found" });

    if (new Date() > entry.expiry) {
      return res.status(410).json({ message: "This URL has expired" });
    }

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const geo = geoip.lookup(ip);
    const referrer = req.get("referer") || "direct";

    await Click.create({ shortcode, referrer, location: geo ? geo.country : "unknown" });

    return res.redirect(entry.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /shorturls/:shortcode – statistics
router.get("/shorturls/:shortcode", async (req, res) => {
  try {
    const { shortcode } = req.params;
    const entry = await Url.findOne({ shortcode });
    if (!entry) return res.status(404).json({ message: "Shortcode not found" });

    const clicks = await Click.find({ shortcode }).sort({ timestamp: -1 });

    res.json({
      shortcode: entry.shortcode,
      originalUrl: entry.originalUrl,
      createdAt: entry.createdAt,
      expiry: entry.expiry,
      totalClicks: clicks.length,
      clickDetails: clicks.map((c) => ({
        timestamp: c.timestamp,
        referrer: c.referrer,
        location: c.location,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
