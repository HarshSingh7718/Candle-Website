import { CustomError } from "../middleware/errorHandler.js";
import { CandleCustomization } from "../models/optionModel.js";
import { Settings } from "../models/settingsModel.js";
import cloudinary, { uploadImage } from "../services/cloudinaryService.js"; // 👉 Import generic uploader

export const initCustomization = async (req, res) => {
  const { steps } = req.body;

  // 1. Wipe any existing configuration so we start completely fresh
  await CandleCustomization.deleteMany({});

  // 2. Create the master document with full steps array
  const masterCustomization = await CandleCustomization.create({
    steps: steps || []
  });

  res.status(201).json({
    success: true,
    message: "Customization settings initialized successfully",
    customization: masterCustomization
  });
};

export const createOption = async (req, res) => {
  const { stepNumber } = req.params;
  const { name, price, stock = 0 } = req.body;

  if (!name || price == null) {
    throw new CustomError("Name and price are required", 400);
  }

  const customization = await CandleCustomization.findOne();
  if (!customization) {
    throw new CustomError("Customization not found", 404);
  }

  // Find step
  const step = customization.steps.find(s => s.stepNumber === Number(stepNumber));
  if (!step) {
    throw new CustomError("Step not found", 404);
  }

  let imageData = {};

  // 👉 Delegate to your generic service (800px for option thumbnails)
  if (req.file) {
    const result = await uploadImage(req.file.buffer, "candle_options", 800);
    imageData = {
      url: result.url,
      public_id: result.public_id
    };
  }

  // Add option to step
  step.options.push({
    name,
    price,
    stock,
    image: imageData
  });

  await customization.save();

  res.status(201).json({
    success: true,
    message: "Option added to step",
    data: step.options
  });
};

export const updateOption = async (req, res) => {
  const { stepNumber, optionId } = req.params;
  const { name, price, stock } = req.body;

  const customization = await CandleCustomization.findOne();
  if (!customization) {
    throw new CustomError("Customization not found", 404);
  }

  const step = customization.steps.find(s => s.stepNumber === Number(stepNumber));
  if (!step) {
    throw new CustomError("Step not found", 404);
  }

  const option = step.options.id(optionId);
  if (!option) {
    throw new CustomError("Option not found", 404);
  }

  // Update fields
  if (name != null) option.name = name;
  if (price != null) option.price = price;
  if (stock != null) option.stock = stock;

  // 👉 Update image (DELETE OLD FIRST)
  if (req.file) {
    if (option.image?.public_id) {
      await cloudinary.uploader.destroy(option.image.public_id);
    }
    
    // 👉 Delegate to your generic service
    const result = await uploadImage(req.file.buffer, "candle_options", 800);
    
    option.image = {
      url: result.url,
      public_id: result.public_id
    };
  }

  await customization.save();

  res.status(200).json({
    success: true,
    message: "Option updated successfully",
    option
  });
};

export const deleteOption = async (req, res) => {
  const { stepNumber, optionId } = req.params;

  const customization = await CandleCustomization.findOne();
  if (!customization) {
    throw new CustomError("Customization not found", 404);
  }

  const step = customization.steps.find(s => s.stepNumber === Number(stepNumber));
  if (!step) {
    throw new CustomError("Step not found", 404);
  }

  const option = step.options.id(optionId);
  if (!option) {
    throw new CustomError("Option not found", 404);
  }

  // DELETE IMAGE
  if (option.image?.public_id) {
    await cloudinary.uploader.destroy(option.image.public_id);
  }

  // REMOVE OPTION
  option.deleteOne();
  await customization.save();

  res.status(200).json({
    success: true,
    message: "Option deleted successfully"
  });
};

export const getAllStepOptions = async (req, res) => {
  const customization = await CandleCustomization.findOne();
  if (!customization) {
    throw new CustomError("Customization not found", 404);
  }

  const settings = await Settings.findOne({ key: "global" });
  const basePrice = settings?.baseCustomisationCharges ?? 100;

  // Sort steps by stepNumber (important for UI)
  const steps = [...customization.steps]
    .sort((a, b) => a.stepNumber - b.stepNumber)
    .map(step => ({
      stepNumber: step.stepNumber,
      title: step.title,
      type: step.type,
      options: step.options
    }));

  res.status(200).json({
    success: true,
    basePrice,
    totalSteps: steps.length,
    steps
  });
};