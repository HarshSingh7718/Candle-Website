import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    image: {
        url: String,
        public_id: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const stepSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true   // e.g. "Select Vessel"
    },
    type: {
        type: String,
        required: true,  // e.g. "vessel", "scent"
        unique: true
    },
    stepNumber: {
        type: Number,
        required: true   // 1,2,3,4
    },
    options: [optionSchema]
});

const candleCustomizationSchema = new mongoose.Schema({
    steps: [stepSchema]
}, { timestamps: true });

export const CandleCustomization = mongoose.model(
    "CandleCustomization",
    candleCustomizationSchema
);

/**
 * Resolves an Option by its nested ID inside the CandleCustomization singleton.
 * Use this instead of .populate("scent") since Option is not a top-level model.
 * 
 * @param {mongoose.Types.ObjectId | String} optionId 
 * @param {String} [stepType] Optional step type to ensure the option is of the correct type (e.g. "vessel")
 * @returns {Promise<Object|null>} The option document or null
 */
export const resolveOptionById = async (optionId, stepType) => {
    const query = { "steps.options._id": optionId };
    if (stepType) {
        query["steps.type"] = stepType;
    }
    
    const config = await CandleCustomization.findOne(
        query,
        { "steps.$": 1 }
    );
    if (!config || !config.steps || config.steps.length === 0) return null;
    
    return config.steps[0].options.id(optionId);
};