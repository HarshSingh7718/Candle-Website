import axios from "axios";
import { config } from "../config/index.js";

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
//  PACKAGING DIMENSION MAP
// =========================
const PACKAGING_DIMENSIONS = {
    small:  { length: 15, breadth: 15, height: 10 },
    medium: { length: 20, breadth: 20, height: 15 },
    large:  { length: 25, breadth: 25, height: 20 }
};

// =========================
//  CREATE SHIPROCKET ORDER
// =========================
// Accepts a fully populated Order document (with user populated)
// Returns { order_id, shipment_id, status, awb_code, courier_name } or null on failure
export const createShiprocketOrder = async (order) => {
    try {
        const token = await getShiprocketToken();

        // Safely extract user info
        const firstName = order.user?.firstName || "Customer";
        const lastName = order.user?.lastName || "";
        const phone = order.user?.phoneNumber || order.shippingAddress?.phone || "9999999999";
        const email = order.user?.email || "customer@example.com";

        // Map packaging to dimensions
        const dims = PACKAGING_DIMENSIONS[order.packaging] || PACKAGING_DIMENSIONS.medium;

        const payload = {
            order_id: order._id.toString(),
            order_date: new Date(order.createdAt).toISOString().split("T")[0],
            pickup_location: "Primary",

            // Billing / Shipping customer
            billing_customer_name: firstName,
            billing_last_name: lastName,
            billing_address: order.shippingAddress.address,
            billing_city: order.shippingAddress.city,
            billing_pincode: order.shippingAddress.pincode,
            billing_state: order.shippingAddress.state,
            billing_country: "India",
            billing_phone: phone,
            billing_email: email,

            shipping_is_billing: true,

            // Items
            order_items: order.orderItems.map(item => ({
                name: item.name,
                sku: item.product
                    ? item.product.toString()
                    : (item.customCandle ? item.customCandle.toString() : "CUSTOM"),
                units: item.quantity,
                selling_price: item.price,
                discount: 0,
                tax: 0
            })),

            // Payment
            payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
            sub_total: order.totalAmount,

            // Dimensions from packaging selection
            length: dims.length,
            breadth: dims.breadth,
            height: dims.height,
            weight: order.weight || 0.5
        };

        const response = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = response.data;
        console.log("✅ Shiprocket Order Created:", {
            order_id: data.order_id,
            shipment_id: data.shipment_id,
            status: data.status
        });

        return {
            order_id: data.order_id,
            shipment_id: data.shipment_id,
            status: data.status,
            awb_code: data.awb_code || null,
            courier_name: data.courier_name || null
        };

    } catch (error) {
        console.error("❌ Shiprocket Order Creation Failed:", error.response?.data || error.message);
        return null;
    }
};