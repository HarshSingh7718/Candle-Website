import { User } from "../models/userModel.js";


export const addShippingAddress = async (req, res) => {
    try {
        const { firstName, lastName, address, city, state, pincode, phone, isDefault } = req.body;

        //  Validation
        if (!firstName || !lastName || !address || !city || !state || !pincode || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // If new address is default → remove old default
        // OR if it's their very first address, force it to be default!
        const shouldBeDefault = isDefault || user.addresses.length === 0;

        if (shouldBeDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        //  Push new address
        user.addresses.push({
            firstName,
            lastName,
            address,
            city,
            state,
            pincode,
            phone,
            isDefault: isDefault || false
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            addresses: user.addresses
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// NEW: Update Address Controller
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { firstName, lastName, address, city, state, pincode, phone, isDefault } = req.body;

        const user = await User.findById(req.user._id);

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        // If they are setting THIS address to default, remove default from others
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        // Update the specific address
        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex].toObject(), // Keep existing _id
            firstName,
            lastName,
            address,
            city,
            state,
            pincode,
            phone,
            isDefault: isDefault || user.addresses[addressIndex].isDefault
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            addresses: user.addresses
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserAddresses = async (req, res) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        addresses: user.addresses
    });
};

export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findById(req.user._id);

        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== addressId
        );

        if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Address deleted"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};