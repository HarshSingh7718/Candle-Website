import axios from "axios";
import { config } from "../config/index.js";
// We don't need to import User or Order here anymore, 
// because verifyPayment already fetches and passes the full order!

// =========================
//  GET TOKEN
// =========================
export const getShiprocketToken = async () => {
    try {
        const res = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/auth/login",
            {
                email: config.shiprocket.user_email,
                password: config.shiprocket.user_password
            }
        );
        return res.data.token;
    } catch (error) {
        console.error("Failed to get Shiprocket Token:", error.response?.data || error.message);
        throw new Error("Shiprocket Authentication Failed");
    }
};

// =========================
//  CREATE SHIPMENT (UTILITY)
// =========================
// 👉 FIX: It now accepts the 'order' object directly instead of req, res
export const createShipment = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findById(orderId).populate("user");
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const token = await getShiprocketToken();

        // Safety fallback just in case the user wasn't populated properly
        const firstName = order.user?.firstName || order.shippingAddress?.firstName || "Customer";
        const lastName = order.user?.lastName || order.shippingAddress?.lastName || "";
        const phone = order.user?.phoneNumber || order.shippingAddress?.phone || "9999999999";

        const payload = {
            order_id: order._id.toString(),
            order_date: new Date(order.createdAt).toISOString().split("T")[0],
            pickup_location: "Primary",

            //  CUSTOMER
            billing_customer_name: `${firstName} ${lastName}`.trim(),
            billing_address: order.shippingAddress.address,
            billing_city: order.shippingAddress.city,
            billing_pincode: order.shippingAddress.pincode,
            billing_state: order.shippingAddress.state,
            billing_country: "India",
            billing_phone: phone,

            //  ITEMS
            order_items: order.orderItems.map(item => ({
                name: item.name,
                // Shiprocket requires a SKU string. We use the product/candle ID.
                sku: item.product ? item.product.toString() : (item.customCandle ? item.customCandle.toString() : "CANDLE"),
                units: item.quantity,
                selling_price: item.price
            })),

            //  PAYMENT
            payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
            sub_total: order.totalAmount,

            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5
        };

        const response = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        // 👉 FIX: Instead of res.status(200), we just return the raw Shiprocket data
        // This data goes straight back to the verifyPayment controller!
        return response.data;

    } catch (error) {
        // We log the error cleanly so you can see it in your terminal
        console.error("Shiprocket Creation Error:", error.response?.data || error.message);

        // 👉 FIX: Instead of res.status(500), we return null so the Razorpay 
        // payment flow can finish successfully even if Shiprocket goes down temporarily.
        return null;
    }
};