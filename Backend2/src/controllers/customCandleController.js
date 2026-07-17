import { CustomError } from "../middleware/errorHandler.js";
import { resolveOptionById } from "../models/optionModel.js";
import { CustomizedCandle } from "../models/customModel.js";
import { Settings } from "../models/settingsModel.js";
export const createCustomCandle = async (req, res) => {
  const {
    vesselId,
    scentId,
    addOnIds = [],
    message,
    // This captures the Step 4 text input
    quantity = 1
  } = req.body;

  // =========================
  //  REQUIRED FIELD CHECK
  // =========================
  if (!vesselId || !scentId) {
    throw new CustomError("Vessel and Scent are required", 400);
  }
  const settings = await Settings.findOne({ key: "global" });
  const basePrice = settings?.baseCustomisationCharges ?? 100;

  // =========================
  //  HELPERS
  // =========================
  const validateOption = (option, name) => {
    if (!option) throw new CustomError(`${name} not found`, 404);
    if (option.stock < quantity) throw new CustomError(`${name} is out of stock`, 400);
  };
  let customizationPrice = 0;

  // =========================
  //  VESSEL
  // =========================
  const vessel = await resolveOptionById(vesselId, "vessel");
  validateOption(vessel, "Vessel");
  customizationPrice += vessel.price;

  // =========================
  //  SCENT
  // =========================
  const scent = await resolveOptionById(scentId, "scent");
  validateOption(scent, "Scent");
  customizationPrice += scent.price;

  // =========================
  //  ADD-ONS
  // =========================
  const uniqueAddOns = [...new Set(addOnIds)];
  let validAddOns = [];
  let addOnNames = [];
  for (let id of uniqueAddOns) {
    const addOn = await resolveOptionById(id, "addOn");
    validateOption(addOn, "Add-on");
    customizationPrice += addOn.price;
    validAddOns.push(addOn._id);
    addOnNames.push(addOn.name);
  }

  // =========================
  //  TOTAL PRICE
  // =========================
  const totalPrice = (basePrice + customizationPrice) * quantity;

  // =========================
  //  CREATE CUSTOM CANDLE
  // =========================
  const candle = await CustomizedCandle.create({
    user: req.user._id,
    vessel: vessel._id,
    scent: scent._id,
    addOns: validAddOns,
    message,
    // Saved directly from req.body
    quantity,
    basePrice,
    customizationPrice,
    totalPrice,
    // 📸 SNAPSHOT 
    snapshot: {
      vesselName: vessel.name,
      vesselImage: vessel.image.url,
      scentName: scent.name,
      addOnNames
    }
  });
  res.status(201).json({
    success: true,
    message: "Custom candle created successfully",
    candle
  });
};