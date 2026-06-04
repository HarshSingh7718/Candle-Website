import mongoose from "mongoose";

/**
 * Settings — Singleton document for store-wide configuration.
 *
 * Enforced as a single document via a fixed `key` field with a unique constraint.
 * Controllers should NEVER use Settings.create() — always use findOneAndUpdate
 * with upsert:true to prevent duplicate documents from spawning.
 */
const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    default: "global",
    unique: true,
    immutable: true, // Prevents mutation of the key field after creation
  },

  // Flat delivery charge applied when order total is below the threshold
  deliveryCharges: {
    type: Number,
    default: 50,
    min: 0,
  },

  // Orders at or above this amount get free delivery
  freeDeliveryThreshold: {
    type: Number,
    default: 500,
    min: 0,
  },

  // Base price for candle customisation
  baseCustomisationCharges: {
    type: Number,
    default: 100,
    min: 0,
  },
}, { timestamps: true });

export const Settings = mongoose.model("Settings", settingsSchema);
