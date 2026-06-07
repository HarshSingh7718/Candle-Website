import crypto from "crypto";
import { Order } from "../models/orderModel.js";
import { User } from "../models/userModel.js";
import { Product } from "../models/productModels.js";
import { CustomizedCandle } from "../models/customModel.js";
import { CandleCustomization } from "../models/optionModel.js";
import { config } from "../config/index.js";
import { sendOrderConfirmationEmail } from "../utils/sendEmail.js";
import { sendSMS } from "../services/otp_services.js";

// =========================
//  RAZORPAY WEBHOOK HANDLER
// =========================
// This acts as a safety net for the client-side verifyPayment flow.
// If the user's browser closes after payment but before verification,
// this webhook catches it and confirms the order server-side.
//
// CRITICAL: This route must receive the RAW body (Buffer), NOT parsed JSON.
//           Mount it with express.raw({ type: "application/json" }) BEFORE express.json().

export const razorpayWebhookHandler = async (req, res) => {
    try {
        // 1. VERIFY SIGNATURE using raw body
        const webhookSecret = config.razor.webhookSecret;
        const signature = req.headers["x-razorpay-signature"];

        if (!signature || !webhookSecret) {
            console.error("❌ Razorpay webhook: Missing signature or webhook secret");
            return res.status(400).json({ success: false, message: "Missing signature" });
        }

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.body) // req.body is a raw Buffer here
            .digest("hex");

        if (expectedSignature !== signature) {
            console.error("❌ Razorpay webhook: Signature mismatch");
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // 2. PARSE BODY after verification
        const event = JSON.parse(req.body.toString());
        console.log(`💳 Razorpay Webhook: ${event.event}`);

        // 3. HANDLE EVENTS
        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;
            const razorpay_order_id = payment.order_id;
            const razorpay_payment_id = payment.id;

            if (!razorpay_order_id) {
                console.error("❌ Razorpay webhook: No order_id in payment entity");
                return res.status(200).json({ success: true, message: "No order_id, skipped" });
            }

            // 4. FIND ORDER
            const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            if (!order) {
                console.error(`❌ Razorpay webhook: Order not found for razorpay_order_id ${razorpay_order_id}`);
                return res.status(200).json({ success: true, message: "Order not found, skipped" });
            }

            // 5. IDEMPOTENCY: If already paid, skip
            if (order.paymentStatus === "paid") {
                console.log(`ℹ️ Razorpay webhook: Order ${order.orderId} already paid, skipping`);
                return res.status(200).json({ success: true, message: "Already processed" });
            }

            // 6. UPDATE ORDER
            order.paymentStatus = "paid";
            order.paymentId = razorpay_payment_id;
            order.paidAt = Date.now();
            order.orderStatus = "confirmed";
            order.statusHistory.push({ status: "confirmed", date: new Date() });

            await order.save();

            // 7. UPDATE STOCK
            const customization = await CandleCustomization.findOne();

            for (let item of order.orderItems) {
                // Simple products
                if (item.type === "simpleCandle" || item.type === "simpleRaw") {
                    const prod = await Product.findById(item.product);
                    if (prod) {
                        prod.stock -= item.quantity;
                        await prod.save();
                    }
                }

                // Custom candles
                if (item.type === "custom" && customization) {
                    const candle = await CustomizedCandle.findById(item.customCandle);
                    if (candle) {
                        const reduceStock = (stepType, optionId) => {
                            if (!optionId) return;
                            const step = customization.steps.find(s => s.type === stepType);
                            if (step) {
                                const opt = step.options.find(i => i._id.toString() === optionId.toString());
                                if (opt && opt.stock >= item.quantity) {
                                    opt.stock -= item.quantity;
                                }
                            }
                        };
                        reduceStock("vessel", candle.vessel);
                        reduceStock("scent", candle.scent);
                        if (candle.addOns?.length > 0) {
                            candle.addOns.forEach(id => reduceStock("addOn", id));
                        }
                    }
                }
            }

            if (customization) {
                customization.markModified("steps");
                await customization.save();
            }

            // 8. CLEAR CART
            const user = await User.findById(order.user);
            if (user) {
                user.cart = [];
                await user.save();
            }

            // 9. PER-USER COUPON CONSUMPTION (WEBHOOK SAFETY NET)
            //    couponProcessed guard prevents double-increment
            if (order.couponApplied && !order.couponProcessed) {
                if (user) {
                    const existingEntry = user.couponUsage.find(
                        (e) => e.couponId.toString() === order.couponApplied.toString()
                    );
                    if (existingEntry) {
                        existingEntry.count += 1;
                    } else {
                        user.couponUsage.push({ couponId: order.couponApplied, count: 1 });
                    }
                    await user.save();
                }

                order.couponProcessed = true;
                await order.save();
            }

            // 9. SEND SMS
            if (user?.phoneNumber) {
                const shortOrderId = order.orderId;
                await sendSMS(
                    user.phoneNumber,
                    config.msg91.orderConfirmTemplateId,
                    {
                        NAME: user.firstName || "Customer",
                        ORDER_ID: shortOrderId,
                        AMOUNT: String(order.totalAmount),
                        URL: `${config.url.frontend}/account/orders/${order.orderId}`
                    }
                ).catch(err => console.error("Razorpay webhook SMS failed:", err.message));
            }

            // Send order confirmation email
            await sendOrderConfirmationEmail(user.email, {
                ...order.toObject(),
                user: { firstName: user.firstName }
            });

            console.log(`✅ Razorpay webhook: Order ${order.orderId} confirmed via payment.captured`);
        }

        // Always return 200 to acknowledge receipt
        return res.status(200).json({ success: true, message: "Webhook processed" });

    } catch (error) {
        console.error("❌ Razorpay Webhook Error:", error.message);
        // Return 200 anyway to prevent Razorpay from retrying
        return res.status(200).json({ success: false, message: "Internal error but acknowledged" });
    }
};
