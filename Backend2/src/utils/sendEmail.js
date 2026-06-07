import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { config } from "../config/index.js";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    pool: true,             // 👉 ADD THIS: Reuses connections (Massive speed boost)
    maxConnections: 5,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const handlebarOptions = {
    viewEngine: {
        extName: '.hbs',
        partialsDir: path.resolve('./src/views/emails/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./src/views/emails/'),
    extName: '.hbs',
};

transporter.use('compile', hbs(handlebarOptions));

export const sendWelcomeEmail = async (email, firstName) => {
    try {
        const mailOptions = {
            from: `"Naisha Creations" <${process.env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: "Welcome to Naisha Creations! ✨",
            template: 'welcome', // matches welcome.hbs
            context: {
                firstName: firstName,
                frontendUrl: config.url.frontend,
                year: new Date().getFullYear(),
                logoUrl: "https://res.cloudinary.com/dk1qzyep1/image/upload/v1780831689/Naisha_brand_ryldmf.jpg",
            }
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Email Error:", error);
    }
};

export const sendOrderConfirmationEmail = async (email, orderData) => {
    try {
        // Build items list
        const items = orderData.orderItems.map(item => ({
            name: item.product?.name || "Custom Candle",
            quantity: item.quantity,
            price: item.price?.toFixed(2) || "0.00",
            type: item.type === "custom" ? "Bespoke Creation" : "Classic Candle"
        }));

        const mailOptions = {
            from: `"Naisha Creations" <${process.env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: `Order Confirmed: #${orderData.orderId} - Naisha Creations`,
            template: 'orderConfirmation', // matches orderConfirmation.hbs
            context: {
                firstName: orderData.user?.firstName || "Customer",
                orderId: orderData.orderId,
                items: items,
                subtotal: (orderData.itemsPrice || 0).toFixed(2),
                shippingPrice: orderData.shippingPrice === 0 ? "Free" : (orderData.shippingPrice || 0).toFixed(2),
                discount: orderData.discount > 0 ? orderData.discount.toFixed(2) : null,
                total: (orderData.totalAmount || 0).toFixed(2),
                shippingAddress: orderData.shippingAddress,
                trackingUrl: `${config.url.frontend}/account/orders/${orderData.orderId}`,
                year: new Date().getFullYear(),
                logoUrl: "https://res.cloudinary.com/dk1qzyep1/image/upload/v1780831689/Naisha_brand_ryldmf.jpg",
            }
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Order Confirmation Email Error:", error);
    }
};