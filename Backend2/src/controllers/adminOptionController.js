import { CandleCustomization } from "../models/optionModel.js";
import cloudinary from "../services/cloudinaryService.js";


export const initCustomization = async (req, res) => {
    try {
        const { basePrice, steps } = req.body;

        if (!basePrice) {
            return res.status(400).json({
                success: false,
                message: "Base price is required"
            });
        }

        // 1. Wipe any existing configuration so we start completely fresh
        await CandleCustomization.deleteMany({});

        // 2. Create the master document with your base price and full steps array
        const masterCustomization = await CandleCustomization.create({
            basePrice,
            steps: steps || []
        });

        res.status(201).json({
            success: true,
            message: "Customization settings initialized successfully",
            customization: masterCustomization
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const createOption = async (req, res) => {
    try {
        const { stepNumber } = req.params;
        const { name, price, stock = 0 } = req.body;
        if (!name || price == null) {
            return res.status(400).json({
                success: false,
                message: "Name and price are required"
            });
        }
        const customization = await CandleCustomization.findOne();

        if (!customization) {
            return res.status(404).json({ message: "Customization not found" });
        }

        //  Find step
        const step = customization.steps.find(
            s => s.stepNumber === Number(stepNumber)
        );

        if (!step) {
            return res.status(404).json({ message: "Step not found" });
        }
        
        let imageData = {};

        //  Upload image
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "candle_options" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            imageData = {
                url: result.secure_url,
                public_id: result.public_id
            };
        }

        //  Add option to step
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

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOption = async (req, res) => {
    try {
        const { stepNumber, optionId } = req.params;
        const { name, price, stock } = req.body;

        const customization = await CandleCustomization.findOne();

        if (!customization) {
            return res.status(404).json({
                success: false,
                message: "Customization not found"
            });
        }

        const step = customization.steps.find(
            s => s.stepNumber === Number(stepNumber)
        );

        if (!step) {
            return res.status(404).json({
                success: false,
                message: "Step not found"
            });
        }

        const option = step.options.id(optionId);

        if (!option) {
            return res.status(404).json({
                success: false,
                message: "Option not found"
            });
        }

        //  Update fields
        if (name != null) option.name = name;
        if (price != null) option.price = price;
        if (stock != null) option.stock = stock;

        //  Update image (DELETE OLD FIRST)
        if (req.file) {
            if (option.image?.public_id) {
                await cloudinary.uploader.destroy(option.image.public_id);
            }

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "candle_options" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            option.image = {
                url: result.secure_url,
                public_id: result.public_id
            };
        }

        await customization.save();

        res.status(200).json({
            success: true,
            message: "Option updated successfully",
            option
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteOption = async (req, res) => {
    try {
        const { stepNumber, optionId } = req.params;

        const customization = await CandleCustomization.findOne();

        if (!customization) {
            return res.status(404).json({
                success: false,
                message: "Customization not found"
            });
        }

        const step = customization.steps.find(
            s => s.stepNumber === Number(stepNumber)
        );

        if (!step) {
            return res.status(404).json({
                success: false,
                message: "Step not found"
            });
        }

        const option = step.options.id(optionId);

        if (!option) {
            return res.status(404).json({
                success: false,
                message: "Option not found"
            });
        }

        //  DELETE IMAGE
        if (option.image?.public_id) {
            await cloudinary.uploader.destroy(option.image.public_id);
        }

        //  REMOVE OPTION
        option.deleteOne();

        await customization.save();

        res.status(200).json({
            success: true,
            message: "Option deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getAllStepOptions = async (req, res) => {
    try {
        const customization = await CandleCustomization.findOne();

        if (!customization) {
            return res.status(404).json({
                success: false,
                message: "Customization not found"
            });
        }

        //  Sort steps by stepNumber (important for UI)
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
            basePrice: customization.basePrice,
            totalSteps: steps.length,
            steps
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
