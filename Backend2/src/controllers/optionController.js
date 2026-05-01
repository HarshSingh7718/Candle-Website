import { CandleCustomization } from "../models/optionModel.js";

export const getOptionsByStep = async (req, res) => {
    try {
        const { step } = req.params;

        const stepMap = {
            1: "vessel",
            2: "scent",
            3: "addOsn",
            4: "label"
        };

        const type = stepMap[step];

        if (!type) {
            return res.status(400).json({
                success: false,
                message: "Invalid step"
            });
        }

        const customization = await CandleCustomization.findOne();

        if (!customization) {
            return res.status(404).json({
                success: false,
                message: "Customization not found"
            });
        }

        //  Find step from steps array
        const stepData = customization.steps.find(
            s => s.type === type
        );

        if (!stepData) {
            return res.status(404).json({
                success: false,
                message: "Step not found"
            });
        }

        //  Filter active options
        const options = stepData.options.filter(
            item => item.isActive !== false
        );

        res.status(200).json({
            success: true,
            step,
            type,
            options
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};