import { Order } from "../models/orderModel.js";
import { config } from "../config/index.js";
import { sendSMS } from "../services/otp_services.js";

// =========================
//  SHIPROCKET STATUS MAP
// =========================
// Maps Shiprocket's current_status strings to our orderStatus enum
const STATUS_MAP = {
    // Picked up / In transit → shipped
    "Picked Up": "shipped",
    "In Transit": "shipped",
    "Reached at Destination Hub": "shipped",

    // Out for delivery
    "Out For Delivery": "out_for_delivery",

    // Delivered
    "Delivered": "delivered",

    // RTO / Cancellation
    "RTO Initiated": "cancelled",
    "RTO Delivered": "cancelled",
    "Cancelled": "cancelled",
    "Undelivered": "cancelled"
};

// =========================
//  WEBHOOK HANDLER
// =========================
export const shiprocketWebhookHandler = async (req, res) => {
    try {
        // 1. SECURITY: Validate webhook token (REQUIRED)
        const incomingToken = req.headers["x-api-key"];
        if (!incomingToken || incomingToken !== config.shiprocket.webhookToken) {
            console.error("❌ Shiprocket webhook: Invalid or missing x-api-key token");
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const payload = req.body;

        // 2. Extract data from Shiprocket webhook payload
        // Shiprocket sends: { order_id, current_status, awb, courier_name, ... }
        const shiprocketOrderId = payload.order_id;
        const currentStatus = payload.current_status;
        const awb = payload.awb;
        const courierName = payload.courier_name;
        const etd = payload.etd; // estimated time of delivery

        if (!shiprocketOrderId || !currentStatus) {
            console.error("❌ Shiprocket webhook: Missing order_id or current_status");
            return res.status(400).json({ success: false, message: "Invalid payload" });
        }

        console.log(`📦 Shiprocket Webhook: Order ${shiprocketOrderId} → ${currentStatus}`);

        // 3. Map Shiprocket status to our status
        const mappedStatus = STATUS_MAP[currentStatus];
        if (!mappedStatus) {
            // Status we don't track — acknowledge but don't update
            console.log(`ℹ️ Shiprocket status "${currentStatus}" not mapped, skipping update.`);
            return res.status(200).json({ success: true, message: "Status acknowledged but not mapped" });
        }

        // 4. Find order — Shiprocket sends back the order_id we gave it (our MongoDB _id)
        let order = await Order.findById(shiprocketOrderId).populate("user", "firstName phoneNumber");

        // Fallback: search by shiprocketOrderId field (numeric ID from Shiprocket)
        if (!order) {
            order = await Order.findOne({ shiprocketOrderId: Number(shiprocketOrderId) })
                .populate("user", "firstName phoneNumber");
        }

        if (!order) {
            console.error(`❌ Shiprocket webhook: Order not found for ID ${shiprocketOrderId}`);
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // 5. Prevent backward transitions (e.g. don't go from "delivered" back to "shipped")
        const statusOrder = ["processing", "placed", "confirmed", "packaged", "shipped", "out_for_delivery", "delivered", "cancelled"];
        const currentIndex = statusOrder.indexOf(order.orderStatus);
        const newIndex = statusOrder.indexOf(mappedStatus);

        if (mappedStatus !== "cancelled" && newIndex <= currentIndex) {
            console.log(`ℹ️ Skipping: ${order.orderStatus} → ${mappedStatus} (not a forward transition)`);
            return res.status(200).json({ success: true, message: "No update needed" });
        }

        // 6. Update order
        order.orderStatus = mappedStatus;
        order.statusHistory.push({ status: mappedStatus, date: new Date() });

        // Update tracking info
        if (awb) order.awbCode = awb;
        if (courierName) order.courierName = courierName;

        // Auto-set date fields
        if (mappedStatus === "shipped") order.shippedAt = Date.now();
        if (mappedStatus === "out_for_delivery") order.outForDeliveryAt = Date.now();
        if (mappedStatus === "delivered") order.deliveredAt = Date.now();
        if (mappedStatus === "cancelled") order.cancelledAt = Date.now();

        await order.save();

        console.log(`✅ Order ${order._id} updated to "${mappedStatus}" via Shiprocket webhook`);

        // 7. Send SMS to customer on key transitions
        if (order.user?.phoneNumber) {
            const shortOrderId = order._id.toString().slice(-6).toUpperCase();
            const shouldSMS = ["shipped", "out_for_delivery", "delivered"].includes(mappedStatus);

            if (shouldSMS) {
                await sendSMS(order.user.phoneNumber, config.msg91.orderStatusTemplateId, {
                    NAME: order.user.firstName || "Customer",
                    ORDER_ID: shortOrderId,
                    STATUS: mappedStatus.replace(/_/g, " ").toUpperCase()
                }).catch(err => console.error("Shiprocket webhook SMS failed:", err.message));
            }
        }

        return res.status(200).json({ success: true, message: "Order updated" });

    } catch (error) {
        console.error("❌ Shiprocket Webhook Error:", error.message);
        // Always return 200 to prevent Shiprocket from retrying endlessly
        return res.status(200).json({ success: false, message: "Internal error but acknowledged" });
    }
};
