import express from "express";
import { adminLogin, adminLogout } from "../controllers/authController.js";
import { createProduct, updateProduct, deleteProduct, getSingleProductAdmin, getAllProductsAdmin } from "../controllers/adminProductController.js";
import { updateReviewStatus, toggleOptionStatus, toggleBannerStatus, toggleProductStatus, toggleCategoryStatus } from "../controllers/adminToggleController.js";
import { isAuthenticated, isAdmin } from "../middleware/authmiddleware.js";
import { getAllReviewsAdmin } from "../controllers/adminReviewController.js";
import { getAdminDashboard } from "../controllers/adminDasboardController.js";
import { upload } from "../middleware/multerMiddleware.js";
import { getAllContacts, updateContactStatus } from "../controllers/adminContactController.js";
import { createCategory, updateCategory, deleteCategory, getAllCategoriesAdmin, getSingleCategoryAdmin, getCategoryProducts, updateCategoryProducts, migrateCategoryToArray } from "../controllers/adminCategoryController.js";
import { initCustomization, createOption, updateOption, deleteOption, getAllStepOptions } from "../controllers/adminOptionController.js";
import { createBanner, getAllBanners, deleteBanner, getSingleBanner, updateBanner} from "../controllers/adminBannerController.js"
import { getAllOrdersAdmin, getSingleOrderAdmin, updateOrderStatus, getAvailableCouriersForOrder, shipOrder } from "../controllers/adminOrderController.js";
import { createCoupon, getAllCoupons, getSingleCoupon, updateCoupon, toggleCouponStatus, deleteCoupon } from "../controllers/couponController.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { getAllUsers, getUserById, blockUser } from "../controllers/adminUserController.js";
import { getSummaryReport, getOrdersReport, getProductsReport, getCustomersReport, exportReport } from "../controllers/adminReportController.js";
import rateLimit from "express-rate-limit";

const blockLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { success: false, message: "Too many block requests. Please try again later." }
});

const router = express.Router();

//Admin Login
router.post("/login", adminLogin);
//Admin Logout
router.post("/logout", isAuthenticated, isAdmin, adminLogout);

// ==========================
//  PRODUCT ROUTES
// ==========================

router.get("/product/:id", isAuthenticated, isAdmin, getSingleProductAdmin);

// Get all products (Admin)
router.get("/products", isAuthenticated, isAdmin, getAllProductsAdmin);

// Create product
router.post(
    "/product",
    isAuthenticated,
    isAdmin,
    upload.array("images", 4),
    createProduct
);

// Update product
router.put(
    "/product/:id",
    isAuthenticated,
    isAdmin,
    upload.array("images", 4),
    updateProduct
);

// Delete product
router.delete(
    "/product/:id",
    isAuthenticated,
    isAdmin,
    deleteProduct
);

// Toggle product status
router.patch(
    "/product/:id/toggle-status",
    isAuthenticated,
    isAdmin,
    toggleProductStatus
);



// ==========================
//  REVIEW ROUTES
// ==========================

// Get all reviews
router.get("/reviews", isAuthenticated, isAdmin, getAllReviewsAdmin);

// Update review status
router.patch(
    "/review/:productId/:reviewId",
    isAuthenticated,
    isAdmin,
    updateReviewStatus
);



// ==========================
//  CONTACT ROUTES
// ==========================

// Get all contacts
router.get(
    "/contacts",
    isAuthenticated,
    isAdmin,
    getAllContacts
);

// Update contact status
router.patch(
    "/contact/:id/status",
    isAuthenticated,
    isAdmin,
    updateContactStatus
);



// ==========================
//  ORDER ROUTES
// ==========================

router.get(
    "/orders/:id/couriers",
    isAuthenticated,
    isAdmin,
    getAvailableCouriersForOrder
);

// Ship order
router.post(
    "/orders/:id/ship",
    isAuthenticated,
    isAdmin,
    shipOrder
);

router.get(
    "/orders/:id",
    isAuthenticated,
    isAdmin,
    getSingleOrderAdmin
);

// Get all orders
router.get(
    "/orders",
    isAuthenticated,
    isAdmin,
    getAllOrdersAdmin
);

// Update order status
router.put(
    "/orders/:id/update",
    isAuthenticated,
    isAdmin,
    updateOrderStatus
);



// ==========================
//  CATEGORY ROUTES
// ==========================

// Create category
router.post(
    "/category",
    isAuthenticated,
    isAdmin,
    upload.single("image"),
    createCategory
);

// Update category
router.put(
    "/category/:id",
    isAuthenticated,
    isAdmin,
    upload.single("image"),
    updateCategory
);

// Delete category
router.delete(
    "/category/:id",
    isAuthenticated,
    isAdmin,
    deleteCategory
);

// Toggle category status
router.patch(
    "/category/:id/toggle",
    isAuthenticated,
    isAdmin,
    toggleCategoryStatus
);

router.get(
    "/category/:id",
    isAuthenticated,
    isAdmin,
    getSingleCategoryAdmin
);


// Get all categories
router.get(
    "/categories",
    isAuthenticated,
    isAdmin,
    getAllCategoriesAdmin
);

// Get products assigned to a category (for category-product management UI)
router.get(
    "/category/:id/products",
    isAuthenticated,
    isAdmin,
    getCategoryProducts
);

// Bulk assign/unassign products to a category
router.put(
    "/category/:id/products",
    isAuthenticated,
    isAdmin,
    updateCategoryProducts
);

// One-time migration: convert single category ObjectId to array
router.post(
    "/migrate-categories",
    isAuthenticated,
    isAdmin,
    migrateCategoryToArray
);



// ==========================
//  BANNER ROUTES
// ==========================

// Create banner
router.post(
  "/banner",
  isAuthenticated,
  isAdmin,
  upload.fields([{ name: 'desktopImage', maxCount: 1 }, { name: 'mobileImage', maxCount: 1 }]), // 🔥 THIS LINE IS REQUIRED
  createBanner
);

// Get single banner (For pre-filling the edit form)
router.get(
    "/banner/:id",
    isAuthenticated,
    isAdmin,
    getSingleBanner
);

// Get all banners
router.get("/banners", isAuthenticated, isAdmin, getAllBanners);

// Update banner
router.put( // or router.patch, depending on your preference
    "/banner/:id",
    isAuthenticated,
    isAdmin,
    upload.fields([{ name: 'desktopImage', maxCount: 1 }, { name: 'mobileImage', maxCount: 1 }]), // 🔥 REQUIRED: In case they change the image!
    updateBanner
);

// Toggle banner
router.patch(
    "/banner/:id/toggle",
    isAuthenticated,
    isAdmin,
    toggleBannerStatus
);

// Delete banner
router.delete(
    "/banner/:id",
    isAuthenticated,
    isAdmin,
    deleteBanner
);



// ==========================
//  CUSTOMIZATION ROUTES
// ==========================

// Get all steps with options
router.get(
    "/customization",
    isAuthenticated,
    isAdmin,
    getAllStepOptions
);

router.post(
    "/customization/init-customization",
    isAuthenticated,
    isAdmin,
    initCustomization
);

// Create option
router.post(
    "/customization/:stepNumber",
    isAuthenticated,
    isAdmin,
    upload.single("image"),
    createOption
);

// Update option
router.put(
    "/customization/:stepNumber/:optionId",
    isAuthenticated,
    isAdmin,
    upload.single("image"),
    updateOption
);

// Delete option
router.delete(
    "/customization/:stepNumber/:optionId",
    isAuthenticated,
    isAdmin,
    deleteOption
);

// Toggle option status
router.patch(
    "/customization/:step/:optionId/toggle",
    isAuthenticated,
    isAdmin,
    toggleOptionStatus
);



// ==========================
//  DASHBOARD
// ==========================

router.get(
    "/dashboard",
    isAuthenticated,
    isAdmin,
    getAdminDashboard
);



// ==========================
//  COUPON ROUTES
// ==========================

// Create coupon
router.post(
    "/coupons",
    isAuthenticated,
    isAdmin,
    createCoupon
);

// Get all coupons
router.get(
    "/coupons",
    isAuthenticated,
    isAdmin,
    getAllCoupons
);

// Get single coupon
router.get(
    "/coupons/:id",
    isAuthenticated,
    isAdmin,
    getSingleCoupon
);

// Update coupon
router.put(
    "/coupons/:id",
    isAuthenticated,
    isAdmin,
    updateCoupon
);

// Toggle coupon status
router.patch(
    "/coupons/:id/toggle",
    isAuthenticated,
    isAdmin,
    toggleCouponStatus
);

// Delete coupon
router.delete(
    "/coupons/:id",
    isAuthenticated,
    isAdmin,
    deleteCoupon
);

// ==========================
//  SETTINGS ROUTES
// ==========================

router.get(
    "/settings",
    isAuthenticated,
    isAdmin,
    getSettings
);

router.put(
    "/settings",
    isAuthenticated,
    isAdmin,
    updateSettings
);

// ==========================
//  USERS ROUTES
// ==========================

router.get(
    "/users",
    isAuthenticated,
    isAdmin,
    getAllUsers
);

router.get(
    "/users/:id",
    isAuthenticated,
    isAdmin,
    getUserById
);

router.put(
    "/users/:id/block",
    isAuthenticated,
    isAdmin,
    blockLimiter,
    blockUser
);

// ==========================
//  REPORTS ROUTES
// ==========================

router.get(
    "/reports/summary",
    isAuthenticated,
    isAdmin,
    getSummaryReport
);

router.get(
    "/reports/orders",
    isAuthenticated,
    isAdmin,
    getOrdersReport
);

router.get(
    "/reports/products",
    isAuthenticated,
    isAdmin,
    getProductsReport
);

router.get(
    "/reports/customers",
    isAuthenticated,
    isAdmin,
    getCustomersReport
);

router.post(
    "/reports/export",
    isAuthenticated,
    isAdmin,
    exportReport
);

export default router;