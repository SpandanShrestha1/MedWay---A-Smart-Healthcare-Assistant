//const express = require('express');
import express from "express";
/*const {
    handleImageUpload,
    addMedicine,
    fetchAllMedicines, 
    getFilteredMedicinesByPharmacy,
    editMedicine,
    deleteMedicine} = require ('../../controllers/pharmacist/medicine-controller.js');*/
import {
  handleImageUpload,
  addMedicine,
  fetchAllMedicines,
  getFilteredMedicinesByPharmacy,
  editMedicine,
  deleteMedicine,
  fetchAllMedicinesByPharmacist,
} from "../../controllers/pharmacist/medicine-controller.js";
import { upload } from "../../helpers/cloudinary.js";
//const {upload} = require('../../helpers/cloudinary');

const router = express.Router();

router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/add", addMedicine);
router.put("/edit/:medicineId", editMedicine);
router.delete("/delete/:medicineId", deleteMedicine);
router.get("/pharmacy/:pharmacistId", fetchAllMedicinesByPharmacist);
router.get("/pharmacy/:userId/filter", getFilteredMedicinesByPharmacy);
router.get("/all/", fetchAllMedicines);

export default router;
