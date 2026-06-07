/**
 * migration.cjs
 *
 * Backfills the `orderId` field for all existing orders that don't have one.
 * Format: NC{last 8 characters of MongoDB _id}
 *
 * Usage:
 *   node migration.cjs
 *
 * Requires MONGO_URI in .env.development (or .env)
 */

const mongoose = require("mongoose");
const path = require("path");

// Load environment variables from .env.development
require("dotenv").config({ path: path.join(__dirname, ".env.development") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in environment variables.");
  process.exit(1);
}

async function migrate() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const ordersCollection = db.collection("orders");

    // Find all orders that are missing the orderId field
    const ordersWithoutId = await ordersCollection
      .find({ $or: [{ orderId: { $exists: false } }, { orderId: null }, { orderId: "" }] })
      .toArray();

    console.log(`📦 Found ${ordersWithoutId.length} orders without orderId`);

    if (ordersWithoutId.length === 0) {
      console.log("✅ No migration needed. All orders already have orderId.");
      await mongoose.disconnect();
      process.exit(0);
    }

    let updated = 0;
    let failed = 0;

    for (const order of ordersWithoutId) {
      const newOrderId = `NC${order._id.toString().slice(-8)}`;
      try {
        await ordersCollection.updateOne(
          { _id: order._id },
          { $set: { orderId: newOrderId } }
        );
        updated++;
        console.log(`  ✅ ${order._id} → ${newOrderId}`);
      } catch (err) {
        failed++;
        console.error(`  ❌ Failed to update ${order._id}: ${err.message}`);
      }
    }

    console.log(`\n🏁 Migration complete: ${updated} updated, ${failed} failed`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrate();
