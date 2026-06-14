import { CustomError } from "../middleware/errorHandler.js";
import { CandleCustomization } from "../models/optionModel.js";
import { Settings } from "../models/settingsModel.js";
export const getOptionsByStep = async (req, res) => {
  const {
    step
  } = req.params;
  const stepMap = {
    1: "vessel",
    2: "scent",
    3: "addOn"
  };
  const type = stepMap[step];
  if (!type) {
    throw new CustomError("Invalid step or step does not require database options", 400);
  }
  const customization = await CandleCustomization.findOne();
  if (!customization) {
    throw new CustomError("Customization not found", 404);
  }
  const stepData = customization.steps.find(s => s.type === type);
  if (!stepData) {
    throw new CustomError("Step not found", 404);
  }
  const options = stepData.options.filter(item => item.isActive !== false);

  const settings = await Settings.findOne({ key: "global" });
  const basePrice = settings?.baseCustomisationCharges;

  res.status(200).json({
    success: true,
    step,
    type,
    basePrice,
    // 👉 ADDED HERE
    options
  });
};