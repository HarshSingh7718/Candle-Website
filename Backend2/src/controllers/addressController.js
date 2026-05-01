import { User } from "../models/userModel.js";


export const addShippingAddress = async (req, res) => {
    try {
        const { address, city, state, pincode, phone, isDefault } = req.body;

        //  Validation
        if (!address || !city || !state || !pincode || !phone) {
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

        //  If new address is default → remove old default
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        //  Push new address
        user.addresses.push({
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

export const getUserAddresses = async (req, res) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        addresses: user.addresses
    });
};

export const deleteAddress = async (req, res) => {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter(
        addr => addr._id.toString() !== addressId
    );

    await user.save();

    res.status(200).json({
        success: true,
        message: "Address deleted"
    });
};