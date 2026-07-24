import express from "express";
import { adminLogin, adminLogout } from "../controllers/authController.js";
import { createProduct, updateProduct, deleteProduct, getSingleProductAdmin, getAllProductsAdmin } from "../controllers/adminProductController.js";
import { updateReviewStatus, toggleOptionStatus, toggleBannerStatus, toggleProductStatus, toggleCategoryStatus } from "../controllers/adminToggleController.js";
import { isAdminAuthenticated, isAdmin } from "../middleware/authmiddleware.js";
import { getAllReviewsAdmin } from "../controllers/adminReviewController.js";
import { getAdminDashboard } from "../controllers/adminDasboardController.js";
import { upload } from "../middleware/multerMiddleware.js";
import { getAllContacts, updateContactStatus } from "../controllers/adminContactController.js";
import { createCategory, updateCategory, deleteCategory, getAllCategoriesAdmin, getSingleCategoryAdmin, getCategoryProducts, updateCategoryProducts, migrateCategoryToArray } from "../controllers/adminCategoryController.js";
import { initCustomization, createOption, updateOption, deleteOption, getAllStepOptions } from "../controllers/adminOptionController.js";
import { createBanner, getAllBanners, deleteBanner, getSingleBanner, updateBanner} from "../controllers/adminBannerController.js"
import { getAllOrdersAdmin, getSingleOrderAdmin, updateOrderStatus, getAvailableCouriersForOrder, shipOrder, createManualOrder } from "../controllers/adminOrderController.js";
import { createCoupon, getAllCoupons, getSingleCoupon, updateCoupon, toggleCouponStatus, deleteCoupon } from "../controllers/couponController.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { getAllUsers, getUserById, blockUser, unblockUser } from "../controllers/adminUserController.js";
import { getSummaryReport, getOrdersReport, getProductsReport, getCustomersReport, exportReport } from "../controllers/adminReportController.js";
import rateLimit from "express-rate-limit";
import { isAuthenticated } from "../middleware/authmiddleware.js";

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
    isAdminAuthenticated,
    isAdmin,
    upload.array("images", 4),
    createProduct
);

// Update product
router.put(
    "/product/:id",
    isAdminAuthenticated,
    isAdmin,
    upload.array("images", 4),
    updateProduct
);

// Delete product
router.delete(
    "/product/:id",
    isAdminAuthenticated,
    isAdmin,
    deleteProduct
);

// Toggle product status
router.patch(
    "/product/:id/toggle-status",
    isAdminAuthenticated,
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
    isAdminAuthenticated,
    isAdmin,
    updateReviewStatus
);



// ==========================
//  CONTACT ROUTES
// ==========================

// Get all contacts
router.get(
    "/contacts",
    isAdminAuthenticated,
    isAdmin,
    getAllContacts
);

// Update contact status
router.patch(
    "/contact/:id/status",
    isAdminAuthenticated,
    isAdmin,
    updateContactStatus
);



// ==========================
//  ORDER ROUTES
// ==========================

router.get(
    "/orders/:id/couriers",
    isAdminAuthenticated,
    isAdmin,
    getAvailableCouriersForOrder
);

// Ship order
router.post(
    "/orders/:id/ship",
    isAdminAuthenticated,
    isAdmin,
    shipOrder
);

router.get(
    "/orders/:id",
    isAdminAuthenticated,
    isAdmin,
    getSingleOrderAdmin
);

// Get all orders
router.get(
    "/orders",
    isAdminAuthenticated,
    isAdmin,
    getAllOrdersAdmin
);

// Create manual order
router.post(
    "/orders/create",
    isAdminAuthenticated,
    isAdmin,
    createManualOrder
);

// Update order status
router.put(
    "/orders/:id/update",
    isAdminAuthenticated,
    isAdmin,
    updateOrderStatus
);



// ==========================
//  CATEGORY ROUTES
// ==========================

// Create category
router.post(
    "/category",
    isAdminAuthenticated,
    isAdmin,
    upload.fields([{ name: 'image', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }]),
    createCategory
);

// Update category
router.put(
    "/category/:id",
    isAdminAuthenticated,
    isAdmin,
    upload.fields([{ name: 'image', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }]),
    updateCategory
);

// Delete category
router.delete(
    "/category/:id",
    isAdminAuthenticated,
    isAdmin,
    deleteCategory
);

// Toggle category status
router.patch(
    "/category/:id/toggle",
    isAdminAuthenticated,
    isAdmin,
    toggleCategoryStatus
);

router.get(
    "/category/:id",
    isAdminAuthenticated,
    isAdmin,
    getSingleCategoryAdmin
);


// Get all categories
router.get(
    "/categories",
    isAdminAuthenticated,
    isAdmin,
    getAllCategoriesAdmin
);

// Get products assigned to a category (for category-product management UI)
router.get(
    "/category/:id/products",
    isAdminAuthenticated,
    isAdmin,
    getCategoryProducts
);

// Bulk assign/unassign products to a category
router.put(
    "/category/:id/products",
    isAdminAuthenticated,
    isAdmin,
    updateCategoryProducts
);

// One-time migration: convert single category ObjectId to array
router.post(
    "/migrate-categories",
    isAdminAuthenticated,
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
    isAdminAuthenticated,
    isAdmin,
    getSingleBanner
);

// Get all banners
router.get("/banners", isAuthenticated, isAdmin, getAllBanners);

// Update banner
router.put( // or router.patch, depending on your preference
    "/banner/:id",
    isAdminAuthenticated,
    isAdmin,
    upload.fields([{ name: 'desktopImage', maxCount: 1 }, { name: 'mobileImage', maxCount: 1 }]), // 🔥 REQUIRED: In case they change the image!
    updateBanner
);

// Toggle banner
router.patch(
    "/banner/:id/toggle",
    isAdminAuthenticated,
    isAdmin,
    toggleBannerStatus
);

// Delete banner
router.delete(
    "/banner/:id",
    isAdminAuthenticated,
    isAdmin,
    deleteBanner
);



// ==========================
//  CUSTOMIZATION ROUTES
// ==========================

// Get all steps with options
router.get(
    "/customization",
    isAdminAuthenticated,
    isAdmin,
    getAllStepOptions
);

router.post(
    "/customization/init-customization",
    isAdminAuthenticated,
    isAdmin,
    initCustomization
);

// Create option
router.post(
    "/customization/:stepNumber",
    isAdminAuthenticated,
    isAdmin,
    upload.single("image"),
    createOption
);

// Update option
router.put(
    "/customization/:stepNumber/:optionId",
    isAdminAuthenticated,
    isAdmin,
    upload.single("image"),
    updateOption
);

// Delete option
router.delete(
    "/customization/:stepNumber/:optionId",
    isAdminAuthenticated,
    isAdmin,
    deleteOption
);

// Toggle option status
router.patch(
    "/customization/:step/:optionId/toggle",
    isAdminAuthenticated,
    isAdmin,
    toggleOptionStatus
);



// ==========================
//  DASHBOARD
// ==========================

router.get(
    "/dashboard",
    isAdminAuthenticated,
    isAdmin,
    getAdminDashboard
);



// ==========================
//  COUPON ROUTES
// ==========================

// Create coupon
router.post(
    "/coupons",
    isAdminAuthenticated,
    isAdmin,
    createCoupon
);

// Get all coupons
router.get(
    "/coupons",
    isAdminAuthenticated,
    isAdmin,
    getAllCoupons
);

// Get single coupon
router.get(
    "/coupons/:id",
    isAdminAuthenticated,
    isAdmin,
    getSingleCoupon
);

// Update coupon
router.put(
    "/coupons/:id",
    isAdminAuthenticated,
    isAdmin,
    updateCoupon
);

// Toggle coupon status
router.patch(
    "/coupons/:id/toggle",
    isAdminAuthenticated,
    isAdmin,
    toggleCouponStatus
);

// Delete coupon
router.delete(
    "/coupons/:id",
    isAdminAuthenticated,
    isAdmin,
    deleteCoupon
);

// ==========================
//  SETTINGS ROUTES
// ==========================

router.get(
    "/settings",
    isAdminAuthenticated,
    isAdmin,
    getSettings
);

router.put(
    "/settings",
    isAdminAuthenticated,
    isAdmin,
    updateSettings
);

// ==========================
//  USERS ROUTES
// ==========================

router.get(
    "/users",
    isAdminAuthenticated,
    isAdmin,
    getAllUsers
);

router.get(
    "/users/:id",
    isAdminAuthenticated,
    isAdmin,
    getUserById
);

router.put(
    "/users/:id/block",
    isAdminAuthenticated,
    isAdmin,
    blockLimiter,
    blockUser
);

router.put(
    "/users/:id/unblock",
    isAdminAuthenticated,
    isAdmin,
    blockLimiter,
    unblockUser
);

// ==========================
//  REPORTS ROUTES
// ==========================

router.get(
    "/reports/summary",
    isAdminAuthenticated,
    isAdmin,
    getSummaryReport
);

router.get(
    "/reports/orders",
    isAdminAuthenticated,
    isAdmin,
    getOrdersReport
);

router.get(
    "/reports/products",
    isAdminAuthenticated,
    isAdmin,
    getProductsReport
);

router.get(
    "/reports/customers",
    isAdminAuthenticated,
    isAdmin,
    getCustomersReport
);

router.post(
    "/reports/export",
    isAdminAuthenticated,
    isAdmin,
    exportReport
);

export default router;