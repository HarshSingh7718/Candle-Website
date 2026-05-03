import { CandleCustomization } from "../models/optionModel.js";

export const getOptionsByStep = async (req, res) => {
    try {
        const { step } = req.params;

        const stepMap = {
            1: "vessel",
            2: "scent",
            3: "addon"
        };

        const type = stepMap[step];

        if (!type) {
            return res.status(400).json({
                success: false,
                message: "Invalid step or step does not require database options"
            });
        }

        const customization = await CandleCustomization.findOne();

        if (!customization) {
            return res.status(404).json({
                success: false,
                message: "Customization not found"
            });
        }

        const stepData = customization.steps.find(
            s => s.type === type
        );

        if (!stepData) {
            return res.status(404).json({
                success: false,
                message: "Step not found"
            });
        }

        const options = stepData.options.filter(
            item => item.isActive !== false
        );

        res.status(200).json({
            success: true,
            step,
            type,
            basePrice: customization.basePrice, // 👉 ADDED HERE
            options
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};