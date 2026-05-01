import { Product } from "../models/productModels.js";

export const getAllReviewsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, rating, status } = req.query;

        const matchStage = {};

        //  Filter by rating
        if (rating) {
            matchStage["reviews.rating"] = Number(rating);
        }

        //  Filter by status
        if (status) {
            matchStage["reviews.status"] = status;
        }

        const result = await Product.aggregate([
            { $unwind: "$reviews" },

            { $match: matchStage },

            {
                $facet: {
                    //  REVIEWS DATA (PAGINATION)
                    reviews: [
                        {
                            $project: {
                                _id: "$reviews._id",
                                productId: "$_id",
                                productName: "$name",
                                user: "$reviews.name",
                                rating: "$reviews.rating",
                                comment: "$reviews.comment",
                                status: "$reviews.status",
                                createdAt: "$reviews.createdAt"
                            }
                        },
                        { $sort: { createdAt: -1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: Number(limit) }
                    ],

                    //  TOTAL COUNT
                    totalCount: [
                        { $count: "count" }
                    ],

                    //  AVERAGE RATING
                    avgRating: [
                        {
                            $group: {
                                _id: null,
                                average: { $avg: "$reviews.rating" }
                            }
                        }
                    ]
                }
            }
        ]);

        const reviews = result[0].reviews;
        const totalReviews = result[0].totalCount[0]?.count || 0;
        const averageRating = result[0].avgRating[0]?.average || 0;

        res.status(200).json({
            success: true,
            currentPage: Number(page),
            totalReviews,
            averageRating: Number(averageRating.toFixed(1)),
            reviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};