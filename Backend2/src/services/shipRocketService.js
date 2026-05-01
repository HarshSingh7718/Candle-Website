import axios from "axios";
import { User } from "../models/userModel.js";
import { Order } from "../models/orderModel.js";
import { config } from "../config/index.js";

// =========================
//  GET TOKEN
// =========================
 export const getShiprocketToken = async () => {
    const res = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/auth/login",
        {
            email: config.shiprocket.user_email,
            password: config.shiprocket.user_password
        }
    );

    return res.data.token;
};

// =========================
//  CREATE SHIPMENT
// =========================
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

        const user = order.user;

        const token = await getShiprocketToken();

        const payload = {
            order_id: order._id.toString(),
            order_date: new Date().toISOString().split("T")[0],

            //  CUSTOMER
            billing_customer_name: `${user.firstName} ${user.lastName}`,
            billing_address: order.shippingAddress.address,
            billing_city: order.shippingAddress.city,
            billing_pincode: order.shippingAddress.pincode,
            billing_state: order.shippingAddress.state,
            billing_country: "India",
            billing_phone: user.phoneNumber,

            //  ITEMS
            order_items: order.orderItems.map(item => ({
                name: item.name,
                units: item.quantity,
                selling_price: item.price
            })),

            //  PAYMENT
            payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",

            sub_total: order.totalAmount,

            //  REQUIRED
            pickup_location: "Primary",

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

        //  Save shipment info in order
        order.shipmentId = response.data.order_id;
        order.awbCode = response.data.awb_code;
        order.shippingStatus = "processing";

        await order.save();

        res.status(200).json({
            success: true,
            message: "Shipment created successfully",
            data: response.data
        });

    } catch (error) {
        console.error(error.response?.data || error.message);

        res.status(500).json({
            success: false,
            message: error.response?.data || error.message
        });
    }
};