import {User} from "../models/userModel.js";

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password -token") //  hide sensitive data
            .populate("wishlist", "name price images")
            .populate("cart.product", "name price images");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};






export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const { firstName, lastName, email } = req.body;

        // =========================
        // EMAIL UPDATE
        // =========================
        if (email !== undefined) {
            const existingUser = await User.findOne({
                email,
                _id: { $ne: req.user._id }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use"
                });
            }

            if (!email.includes("@")) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email"
                });
            }

            user.email = email;
        }

        // =========================
        // BASIC INFO UPDATE
        // =========================
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


