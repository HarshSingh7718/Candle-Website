import router from './routes/authRoute.js'
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import addressRoutes from "./routes/addressRoute.js";
import cartRoutes from "./routes/cartRoutes.js";
import adminRoutes from "./routes/adminRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
import contactRoutes from "./routes/contactRoute.js";
import customizationRoutes from "./routes/customRoutes.js";
import homeRoutes from "./routes/homeRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import paymentRoutes from "./routes/paymentsRoute.js";
import productRoutes from "./routes/productRoute.js";
import searchRoutes from "./routes/searchRoute.js";
import shipmentRoutes from "./routes/shipmentRoutes.js";
import userRoutes from "./routes/userProfileRoute.js";
import wishlistRoutes from "./routes/whishlistRoute.js";



const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5174",// Local development
    "http://localhost:5175",
];

app.use(cors({
    origin: allowedOrigins, // your frontend
    credentials: true
}));
// ==========================
//  ADMIN ROUTES
// ==========================
app.use("/api/admin", adminRoutes);

// AUTH ROUTES
app.use('/api/auth/user', router)

// ADDRESS ROUTES
app.use("/api/address", addressRoutes);

// CART ROUTES
app.use("/api/cart", cartRoutes);

// CATEGORY ROUTES
app.use("/api", categoryRoutes);

// CONTACT ROUTES
app.use("/api", contactRoutes);

// CUSTOM CANDLE ROUTES
app.use("/api", customizationRoutes);

// HOME ROUTES
app.use("/api", homeRoutes);

// ORDER ROUTES
app.use("/api", orderRoutes);

// PAYMENT ROUTES
app.use("/api/payment", paymentRoutes);

// PRODUCT ROUTES
app.use("/api", productRoutes);

// SEARCH ROUTES
app.use("/api", searchRoutes);

// SHIPMENT ROUTES
app.use("/api", shipmentRoutes);

// USER ROUTES
app.use("/api", userRoutes);

// WHISHLIST ROUTES
app.use("/api", wishlistRoutes);

export default app