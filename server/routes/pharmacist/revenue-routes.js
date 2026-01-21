import express from "express";
import {
  getRevenueStats,
  getRevenueTrend,
  getTopSellingCategories,
  getTopSellingMedicines,
  getRecentCompletedTransactions,
  getEarningsOverview,
  placeWithdrawlRequest,
  getMonthlyRevenueStats,
  getWithdrawlHistory,
  getDailyRevenue,
  getWeeklyRevenue,
  getMonthlyRevenue,
} from "../../controllers/pharmacist/revenue-controller.js";

const router = express.Router();

router.get("/revenue-stats", getRevenueStats);
router.get("/revenue-trend", getRevenueTrend);
router.get("/revenue-topSelling-cat", getTopSellingCategories);
router.get("/revenue-topSelling-med", getTopSellingMedicines);
router.get("/revenue-recent-transactions", getRecentCompletedTransactions);
router.get("/revenue-earnings-overview", getEarningsOverview);
router.put("/place-withdrawl-request", placeWithdrawlRequest);
router.get("/revenue-earnings-monthly", getMonthlyRevenueStats);
router.get("/revenue-withdrawl-history", getWithdrawlHistory);
router.post("/revenue-daily", getDailyRevenue);
router.post("/revenue-weekly", getWeeklyRevenue);
router.post("/revenue-monthly", getMonthlyRevenue);

export default router;
