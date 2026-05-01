import { User } from '../models/userModel.js';

export const addToWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;

        const user = await User.findById(userId);

        // Prevent duplicate
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({
                success: false,
                message: "Already in wishlist"
            });
        }

        user.wishlist.push(productId);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Added to wishlist"
        });

    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};


export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;

        const user = await User.findById(userId);

        user.wishlist = user.wishlist.filter(
            id => id.toString() !== productId
        );

        await user.save();

        res.status(200).json({
            success: true,
            message: "Removed from wishlist"
        });

    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("wishlist");

        res.status(200).json({
            success: true,
            wishlist: user.wishlist
        });

    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};