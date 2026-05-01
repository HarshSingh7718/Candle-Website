import {Product} from "../models/productModels.js";

export const searchProducts = async (req, res) => {
    try {
        const {
            keyword,
            category,
            type,
            minPrice,
            maxPrice,
            page = 1,
            limit = 10
        } = req.query;

        let query = { isActive: true };

        //  Search by keyword
        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { tags: { $regex: keyword, $options: "i" } }
            ];
        }

        //  Category filter
        if (category) {
            query.category = category;
        }

        //  Type filter
        if (type) {
            query.type = type;
        }

        //  Price filter (discountPrice OR price)
        if (minPrice || maxPrice) {
            query.$expr = {
                $and: [
                    ...(minPrice
                        ? [{ $gte: [{ $ifNull: ["$discountPrice", "$price"] }, Number(minPrice)] }]
                        : []),
                    ...(maxPrice
                        ? [{ $lte: [{ $ifNull: ["$discountPrice", "$price"] }, Number(maxPrice)] }]
                        : [])
                ]
            };
        }

        //  Pagination logic
        const skip = (Number(page) - 1) * Number(limit);

        const products = await Product.find(query)
            .skip(skip)
            .limit(Number(limit))
            .select("name price discountPrice images ratings type");

        const totalProducts = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            totalProducts,
            currentPage: Number(page),
            totalPages: Math.ceil(totalProducts / limit),
            count: products.length,
            products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};