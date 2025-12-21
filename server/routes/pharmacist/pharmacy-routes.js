import express from "express";
import {
  addPharmacy,
  fetchAllPharmaciesByUser,
  fetchPharmacyById,
  editPharmacy,
  deletePharmacy,
} from "../../controllers/pharmacist/pharmacy-controller.js";
const router = express.Router();

router.post("/add", addPharmacy);
router.get("/get/:userId", fetchAllPharmaciesByUser);
router.get("/single/:pharmacyId", fetchPharmacyById);
router.put("/update/:userId/:pharmacyId", editPharmacy);
router.delete("/delete/:userId/:pharmacyId", deletePharmacy);

export default router;
