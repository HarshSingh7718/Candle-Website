import { Order } from "../models/orderModel.js";
import {User} from "../models/userModel.js";
import {Product} from "../models/productModels.js";
import { CustomizedCandle } from "../models/customModel.js";
import { sendSMS } from "../services/otp_services.js";



export const createOrder = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("cart.product")
            .populate("cart.customCandle");

        const {
            address,
            city,
            state,
            pincode,
            phone,
            paymentMethod = "razorpay",

            //  BUY NOW
            productId,
            quantity = 1
        } = req.body;

        let orderItems = [];

        // =========================
        //  BUY NOW (ONLY SIMPLE)
        // =========================
        if (productId) {
            const prod = await Product.findById(productId);

            if (!prod || prod.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Product out of stock"
                });
            }

            orderItems.push({
                type: prod.type,
                product: prod._id,
                name: prod.name,
                quantity,
                price: prod.discountPrice || prod.price,
                image: prod.images?.[0]?.url || ""
            });
        }

        // =========================
        //  CART FLOW (SIMPLE + CUSTOM)
        // =========================
        else {
            if (!user || user.cart.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Cart is empty"
                });
            }

            for (let item of user.cart) {

                //  SIMPLE PRODUCT
                if (item.type === "simpleCandle" || item.type === "simpleRaw") {
                    const prod = item.product;

                    if (!prod || prod.stock < item.quantity) {
                        return res.status(400).json({
                            success: false,
                            message: `${prod.name} out of stock`
                        });
                    }

                    orderItems.push({
                        type: prod.type,
                        product: prod._id,
                        name: prod.name,
                        quantity: item.quantity,
                        price: prod.discountPrice || prod.price,
                        image: prod.images?.[0]?.url || ""
                    });
                }

                //  CUSTOM CANDLE
                if (item.type === "custom") {
                    const candle = item.customCandle;

                    if (!candle) {
                        return res.status(400).json({
                            success: false,
                            message: "Custom candle not found"
                        });
                    }

                    orderItems.push({
                        type: "custom",
                        customCandle: candle._id,
                        name: `Custom Candle (${candle.snapshot.sizeName})`,
                        quantity: item.quantity,
                        price: candle.totalPrice,
                        image: "" // optional
                    });
                }
            }
        }

        // =========================
        //  PRICING
        // =========================
        let itemsPrice = 0;

        orderItems.forEach(item => {
            itemsPrice += item.price * item.quantity;
        });

        const shippingPrice = itemsPrice > 999 ? 0 : 99;
        const taxPrice = itemsPrice * 0.05;
        const totalAmount = Math.round(
            itemsPrice + shippingPrice + taxPrice
        );

        // =========================
        //  CREATE ORDER
        // =========================
        const order = await Order.create({
            user: user._id,
            orderItems,
            shippingAddress: {
                address,
                city,
                state,
                pincode,
                phone
            },

            itemsPrice,
            shippingPrice,
            taxPrice,
            totalAmount,
            paymentMethod,
            paymentStatus:
                paymentMethod === "cod" ? "pending" : "paid",
            paidAt:
                paymentMethod === "cod" ? null : Date.now(),
            statusHistory: [{ status: "processing" }]
        });


        //  SEND SMS ONLY FOR COD
        if (paymentMethod === "cod") {
            sendSMS(
                user.phoneNumber,
                `Your COD order ${order._id} has been placed successfully. Pay ₹${order.totalAmount} at delivery.`
            );
        }
        // =========================
        //  CLEAR CART
        // =========================
        if (!productId) {
            user.cart = [];
            await user.save();
        }

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// import Razorpay from "razorpay";
// import { Order } from "../models/orderModel.js";
// import Product from "../models/productModel.js";
// import { CandleCustomization } from "../models/candleCustomization.js";
// import { CustomizedCandle } from "../models/customizedCandle.js";

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// export const cancelOrder = async (req, res) => {
//     try {
//         const { orderId, reason } = req.body;

//         const order = await Order.findById(orderId);

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found"
//             });
//         }

//         if (order.orderStatus === "delivered") {
//             return res.status(400).json({
//                 success: false,
//                 message: "Cannot cancel delivered order"
//             });
//         }

//         // =========================
//         //  RESTORE STOCK
//         // =========================
//         const customization = await CandleCustomization.findOne();

//         for (let item of order.orderItems) {

//             //  SIMPLE PRODUCT
//             if (item.type === "simple") {
//                 const prod = await Product.findById(item.product);
//                 if (prod) {
//                     prod.stock += item.quantity;
//                     await prod.save();
//                 }
//             }

//             //  CUSTOM CANDLE
//             if (item.type === "custom") {
//                 const candle = await CustomizedCandle.findById(item.customCandle);

//                 if (candle && customization) {

//                     const restore = (arr, id) => {
//                         const opt = arr.find(i => i._id.toString() === id?.toString());
//                         if (opt) opt.stock += item.quantity;
//                     };

//                     restore(customization.scents, candle.scent);
//                     restore(customization.colors, candle.color);
//                     restore(customization.sizes, candle.size);

//                     candle.addOns.forEach(addOnId => {
//                         restore(customization.addOns, addOnId);
//                     });
//                 }
//             }
//         }

//         await customization.save();

//         // =========================
//         //  UPDATE STATUS
//         // =========================
//         order.orderStatus = "cancelled";
//         order.cancelReason = reason;
//         order.cancelledAt = Date.now();

//         // =========================
//         //  REFUND
//         // =========================
//         if (
//             order.paymentMethod === "razorpay" &&
//             order.paymentStatus === "paid"
//         ) {
//             const refund = await razorpay.payments.refund(order.paymentId, {
//                 amount: order.totalAmount * 100
//             });

//             order.paymentStatus = "refunded";
//             order.refundId = refund.id;
//         }

//         await order.save();

//         res.status(200).json({
//             success: true,
//             message: "Order cancelled & stock restored"
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };