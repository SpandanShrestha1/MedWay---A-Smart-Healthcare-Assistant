import express from "express";
import {
  getAllOrdersOfPharmacist,
  updateOrderStatus,
  getOrderDetailsForPharmacist,
} from "../../controllers/pharmacist/order-controller.js";
const router = express.Router();

router.get("/pharmacy/orders/:userId", getAllOrdersOfPharmacist);
router.get("/pharmacy/orderdetail/:id", getOrderDetailsForPharmacist);
router.patch("/pharmacy/orders/:id/status", updateOrderStatus);

export default router;
