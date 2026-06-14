import axios from "axios";
import { config } from "../config/index.js";

// =========================
//  TOKEN CACHE (In-Memory)
// =========================
// Shiprocket tokens last ~10 days. We cache for 9 days to be safe.
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // 9 days in milliseconds
let cachedToken = null;
let tokenExpiresAt = 0;

// =========================
//  GET TOKEN (Cached)
// =========================
export const getShiprocketToken = async () => {
    // Return cached token if still valid
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    try {
        const res = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/auth/login",
            {
                email: config.shiprocket.user_email,
                password: config.shiprocket.user_password
            }
        );
        cachedToken = res.data.token;
        tokenExpiresAt = Date.now() + TOKEN_TTL_MS;
        return cachedToken;
    } catch (error) {
        console.error("Failed to get Shiprocket Token:", error.response?.data || error.message);
        throw new Error("Shiprocket Authentication Failed");
    }
};

// =========================
//  CHECK SERVICEABILITY
// =========================
/**
 * Checks if a pincode is deliverable and whether COD is available.
 * @param {Object} params
 * @param {string} params.delivery_postcode - The customer's delivery pincode
 * @param {number} [params.weight=0.5]      - Package weight in kg
 * @param {number} [params.cod=0]           - 1 for COD check, 0 for Prepaid
 * @returns {Promise<{ deliverable: boolean, codAvailable: boolean }>}
 */
export const checkServiceability = async ({ delivery_postcode, weight = 0.5, cod = 0 }) => {
    try {
        const token = await getShiprocketToken();

        const res = await axios.get(
            "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                params: {
                    pickup_postcode: config.shiprocket.pickup_pincode,
                    delivery_postcode,
                    weight,
                    cod
                }
            }
        );

        const couriers = res.data?.data?.available_courier_companies || [];
        const deliverable = couriers.length > 0;
        const codAvailable = cod === 1 ? couriers.some(c => c.cod === 1) : false;

        return { deliverable, codAvailable };
    } catch (error) {
        console.error("Shiprocket Serviceability Check Failed:", error.response?.data || error.message);
        // On API failure, allow the operation to proceed (fail-open)
        // so a temporary Shiprocket outage doesn't block all orders
        return { deliverable: true, codAvailable: true };
    }
};

// =========================
//  PACKAGING DIMENSION MAP
// =========================
const PACKAGING_DIMENSIONS = {
    small:  { length: 12.7, breadth: 12.7, height: 12.7 },
    medium: { length: 15.24, breadth: 15.24, height: 15.24 },
    large:  { length: 28, breadth: 15.24, height: 12.7 }
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
        const firstName = order.shippingAddress?.firstName || "Customer";
        const lastName = order.shippingAddress?.lastName || "";
        const phone = order.shippingAddress?.phone || "9999999999";
        const email = order.user?.email || "customer@example.com";

        // Map packaging to dimensions
        const dims = PACKAGING_DIMENSIONS[order.packaging] || PACKAGING_DIMENSIONS.medium;

        const payload = {
            order_id: order._id.toString(),
            order_date: new Date(order.createdAt).toISOString().split("T")[0],
            pickup_location: "Home",

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
                sku: item.slug
                    ? item.slug
                    : (item.customCandle ? item.customCandle.toString() : "CUSTOM"),
                units: item.quantity,
                selling_price: item.price,
                discount: 0,
            })),

            // Payment
            payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
            shipping_charges: order.shippingPrice,
            total_discount: order.discountAmount,
            sub_total: order.totalAmount,

            // Dimensions from packaging selection
            length: dims.length,
            breadth: dims.breadth,
            height: dims.height,
            weight: order.weight || 0.5,
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

// =========================
//  GET AVAILABLE COURIERS
// =========================
export const getAvailableCouriers = async (shiprocketOrderId) => {
    try {
        const token = await getShiprocketToken();
        const res = await axios.get(
            `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?order_id=${shiprocketOrderId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return res.data?.data?.available_courier_companies || [];
    } catch (error) {
        console.error("❌ Failed to fetch available couriers:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch available couriers");
    }
};

// =========================
//  ASSIGN AWB
// =========================
export const assignAWB = async (shipmentId, courierId) => {
    try {
        const token = await getShiprocketToken();
        const payload = {
            shipment_id: shipmentId,
            courier_id: courierId
        };
        const res = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return res.data;
    } catch (error) {
        console.error("❌ Failed to assign AWB:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to assign AWB");
    }
};

// =========================
//  SCHEDULE PICKUP
// =========================
export const schedulePickup = async (shipmentId, pickupDate) => {
    try {
        const token = await getShiprocketToken();
        const payload = {
            shipment_id: [shipmentId]
        };
        if (pickupDate) {
            payload.pickup_date = [pickupDate];
        }
        
        const res = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return res.data;
    } catch (error) {
        console.error("❌ Failed to schedule pickup:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to schedule pickup");
    }
};

// =========================
//  GENERATE LABEL
// =========================
export const generateLabel = async (shipmentId) => {
    try {
        const token = await getShiprocketToken();
        const res = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/courier/generate/label",
            { shipment_id: [shipmentId] },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return res.data?.label_created === 1 ? res.data.label_url : null;
    } catch (error) {
        console.error("❌ Failed to generate label:", error.response?.data || error.message);
        // Don't throw here, just return null so it doesn't break the flow
        return null; 
    }
};

// =========================
//  GENERATE INVOICE
// =========================
export const generateInvoice = async (orderId) => {
    try {
        const token = await getShiprocketToken();
        const res = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/orders/print/invoice",
            { ids: [orderId] },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return res.data?.is_invoice_created ? res.data.invoice_url : null;
    } catch (error) {
        console.error("❌ Failed to generate invoice:", error.response?.data || error.message);
        // Don't throw here, just return null so it doesn't break the flow
        return null;
    }
};

// =========================
//  GENERATE MANIFEST
// =========================
export const generateManifest = async (shipmentId) => {
    try {
        const token = await getShiprocketToken();
        const res = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/manifests/generate",
            { shipment_id: [shipmentId] },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return res.data?.manifest_url ? res.data.manifest_url : null;
    } catch (error) {
        console.error("❌ Failed to generate manifest:", error.response?.data || error.message);
        return null;
    }
};
