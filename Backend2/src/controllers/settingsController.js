import { Settings } from "../models/settingsModel.js";
import { CustomError } from "../middleware/errorHandler.js";

/**
 * getSettings — Returns the singleton settings document.
 *
 * Uses findOneAndUpdate with upsert:true to create the document with
 * defaults if it doesn't exist yet. Never uses Settings.create().
 */
export const getSettings = async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    { key: "global" },
    { $setOnInsert: { key: "global" } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );

  res.status(200).json({
    success: true,
    settings,
  });
};

/**
 * updateSettings — Updates store-wide pricing configuration.
 *
 * STRICTLY uses findOneAndUpdate — never Settings.create().
 * This ensures that even if a malicious request passes a different key,
 * it will always target the singleton "global" document.
 */
export const updateSettings = async (req, res) => {
  const { deliveryCharges, freeDeliveryThreshold, baseCustomisationCharges } = req.body;

  // Build the update object with only the fields that were provided
  const updateFields = {};
  if (deliveryCharges !== undefined) {
    if (typeof deliveryCharges !== "number" || deliveryCharges < 0) {
      throw new CustomError("Delivery charges must be a non-negative number", 400);
    }
    updateFields.deliveryCharges = deliveryCharges;
  }
  if (freeDeliveryThreshold !== undefined) {
    if (typeof freeDeliveryThreshold !== "number" || freeDeliveryThreshold < 0) {
      throw new CustomError("Free delivery threshold must be a non-negative number", 400);
    }
    updateFields.freeDeliveryThreshold = freeDeliveryThreshold;
  }
  if (baseCustomisationCharges !== undefined) {
    if (typeof baseCustomisationCharges !== "number" || baseCustomisationCharges < 0) {
      throw new CustomError("Base customisation charges must be a non-negative number", 400);
    }
    updateFields.baseCustomisationCharges = baseCustomisationCharges;
  }

  if (Object.keys(updateFields).length === 0) {
    throw new CustomError("No valid fields to update", 400);
  }

  const settings = await Settings.findOneAndUpdate(
    { key: "global" },
    { $set: updateFields },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Settings updated successfully",
    settings,
  });
};
