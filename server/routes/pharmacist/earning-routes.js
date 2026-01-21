import express from "express";
import {
  EarningPageStats,
  EarningBreakdown,
  EarningMonthlySummary,
  getCompletedWithdrawlHistory,
  getRequestedWithdrawlHistory,
  addPaymentMethod,
  getPaymentMethodById,
  getPaymentMethods,
  updatePaymentMethod,
  EarningPageOverview,
  EarningPagePaymentHistory,
  EarningPagePendingAmount,
  EarningPagePaymentMethods,
} from "../../controllers/pharmacist/earning-controller.js";

const router = express.Router();

router.get("/earning-stats", EarningPageStats);
router.get("/earning-breakdown", EarningBreakdown);
router.get("/earning-monthly-summary", EarningMonthlySummary);
router.get(
  "/earning-completed-withdrawl-history",
  getCompletedWithdrawlHistory
);
router.get(
  "/earning-requested-withdrawl-history",
  getRequestedWithdrawlHistory
);
router.post("/add-payment-method", addPaymentMethod);
router.get("/get-all-payment-methods", getPaymentMethods);
router.put("/update-payment-method/:paymentMethodId", updatePaymentMethod);
router.get("/single-payment-method/:paymentMethodId", getPaymentMethodById);
router.get("/earning-overview", EarningPageOverview);
router.get("/earning-payment-history", EarningPagePaymentHistory);
router.get("/earning-pending-amount", EarningPagePendingAmount);
router.get("/earning-payment-methods", EarningPagePaymentMethods);

export default router;
