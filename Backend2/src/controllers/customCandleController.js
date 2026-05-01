import { CandleCustomization } from "../models/optionModel.js";
import { CustomizedCandle } from "../models/customModel.js";

export const createCustomCandle = async (req, res) => {
    try {
        const {
            vesselId,
            scentId,
            addOnIds = [],
            message, // This captures the Step 4 text input
            quantity = 1
        } = req.body;

        // =========================
        //  REQUIRED FIELD CHECK
        // =========================
        if (!vesselId || !scentId) {
            return res.status(400).json({
                success: false,
                message: "Vessel and Scent are required"
            });
        }

        const customization = await CandleCustomization.findOne();

        if (!customization) {
            return res.status(400).json({
                success: false,
                message: "Customization data not found"
            });
        }

        // =========================
        //  HELPERS
        // =========================
        const findStep = (type) =>
            customization.steps.find(step => step.type === type);

        const findOption = (step, id) =>
            step?.options.find(opt => opt._id.toString() === id);

        const validateOption = (option, name) => {
            if (!option) throw new Error(`${name} not found`);
            if (option.stock < quantity)
                throw new Error(`${name} is out of stock`);
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
        const totalPrice =
            (customization.basePrice + customizationPrice) * quantity;

        // =========================
        //  CREATE CUSTOM CANDLE
        // =========================
        const candle = await CustomizedCandle.create({
            user: req.user._id,
            vessel: vessel._id,
            scent: scent._id,
            addOns: validAddOns,
            message, // Saved directly from req.body
            quantity,
            basePrice: customization.basePrice,
            customizationPrice,
            totalPrice,

            // 📸 SNAPSHOT 
            snapshot: {
                vesselName: vessel.name,
                scentName: scent.name,
                addOnNames
            }
        });

        res.status(201).json({
            success: true,
            message: "Custom candle created successfully",
            candle
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};