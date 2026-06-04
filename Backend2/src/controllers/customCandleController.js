import { CustomError } from "../middleware/errorHandler.js";
import { CandleCustomization } from "../models/optionModel.js";
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
  const customization = await CandleCustomization.findOne();
  if (!customization) {
    throw new CustomError("Customization data not found", 400);
  }

  const settings = await Settings.findOne({ key: "global" });
  const basePrice = settings?.baseCustomisationCharges ?? 100;

  // =========================
  //  HELPERS
  // =========================
  const findStep = type => customization.steps.find(step => step.type === type);
  const findOption = (step, id) => step?.options.find(opt => opt._id.toString() === id);
  const validateOption = (option, name) => {
    if (!option) throw new Error(`${name} not found`);
    if (option.stock < quantity) throw new Error(`${name} is out of stock`);
  };
  let customizationPrice = 0;

  // =========================
  //  VESSEL
  // =========================
  const vesselStep = findStep("vessel");
  const vessel = findOption(vesselStep, vesselId);
  validateOption(vessel, "Vessel");
  customizationPrice += vessel.price;

  // =========================
  //  SCENT
  // =========================
  const scentStep = findStep("scent");
  const scent = findOption(scentStep, scentId);
  validateOption(scent, "Scent");
  customizationPrice += scent.price;

  // =========================
  //  ADD-ONS
  // =========================
  const addOnStep = findStep("addon");
  const uniqueAddOns = [...new Set(addOnIds)];
  let validAddOns = [];
  let addOnNames = [];
  for (let id of uniqueAddOns) {
    const addOn = findOption(addOnStep, id);
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
      vesselImage: vessel.image,
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