import express from "express";
import dashboardController from "../../controllers/pharmacist/dashboard-controller.js";
import { authenticatePharmacist } from "../../middleware/auth.js";

const router = express.Router();

/**
 * All Dashboard Routes Require Pharmacist Authentication
 * req.user will include pharmacyId from token/session
 */

// Dashboard Stats (pending orders, low stock count, sales today, total items)
router.get("/stats", dashboardController.getPharmacyDashboardStats);

// Recent Orders (last 10)
router.get("/recent-orders", dashboardController.getRecentOrders);

// Low Stock Alerts (stock < 10)
router.get("/low-stock", dashboardController.getLowStockAlerts);

export default router;
