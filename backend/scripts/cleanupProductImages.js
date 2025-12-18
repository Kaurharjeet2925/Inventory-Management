// Ensure env is loaded when running this script directly
require('dotenv').config();
const connectDB = require('../config/db');
const Product = require('../models/product.model');

(async () => {
  try {
    // If MONGO_URI is missing, give a helpful error rather than a cryptic mongoose message
    if (!process.env.MONGO_URI) {
      console.error('❌ Missing MONGO_URI environment variable. Please set it in .env or export it before running this script.');
      process.exit(1);
    }

    await connectDB();
    console.log('Connected to DB, starting cleanup...');

    const products = await Product.find();
    let changed = 0;

    for (const p of products) {
      let updated = false;

      if (p.thumbnail && /^\/?uploads\//.test(p.thumbnail)) {
        p.thumbnail = p.thumbnail.replace(/^\/?uploads\//, '');
        updated = true;
      }

      if (Array.isArray(p.images) && p.images.length > 0) {
        const newImages = p.images.map(img => (typeof img === 'string' ? img.replace(/^\/?uploads\//, '') : img));
        if (JSON.stringify(newImages) !== JSON.stringify(p.images)) {
          p.images = newImages;
          updated = true;
        }
      }

      if (updated) {
        await p.save();
        changed++;
        console.log(`Updated product ${p._id}: thumbnail=${p.thumbnail}, images=${p.images}`);
      }
    }

    console.log(`Cleanup finished. Records updated: ${changed}`);
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
})();