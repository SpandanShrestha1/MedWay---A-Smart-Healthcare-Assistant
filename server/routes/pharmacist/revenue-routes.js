import express from "express";
import {
  getRevenueStats,
  getRevenueTrend,
  getTopSellingCategories,
  getTopSellingMedicines,
  getRecentCompletedTransactions,
} from "../../controllers/pharmacist/revenue-controller.js";

const router = express.Router();

router.get("/revenue-stats", getRevenueStats);
router.get("/revenue-trend", getRevenueTrend);
router.get("/revenue-topSelling-cat", getTopSellingCategories);
router.get("/revenue-topSelling-med", getTopSellingMedicines);
router.get("/revenue-recent-transactions", getRecentCompletedTransactions);

export default router;
