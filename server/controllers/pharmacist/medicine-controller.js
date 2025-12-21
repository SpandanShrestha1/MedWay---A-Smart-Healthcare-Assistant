//const { imageUploadUtil } = require("../../helpers/cloudinary");
import imageUploadUtil from "../../helpers/cloudinary.js";
import { Op } from "sequelize";

import { db } from "../../db/db.js";
const Medicine = db.Medicine;
const User = db.User;
const Pharmacy = db.Pharmacy;

export const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occured",
    });
  }
};

// add a medicine
export const addMedicine = async (req, res) => {
  try {
    const {
      userId,
      medicineName,
      description,
      image,
      category,
      brand,
      stockQuantity,
      price,
      expiryDate,
      isPrescriptionRequired,
      pharmacyId,
    } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role !== "pharmacist") {
      return res.status(403).json({
        success: false,
        message: "Only pharmacists can add medicine",
      });
    }

    const pharmacy = await Pharmacy.findOne({
      where: { pharmacyId, userId },
    });

    if (!pharmacy) {
      return res.status(403).json({
        success: false,
        message: "You do not own this pharmacy",
      });
    }

    const newlyCreatedMedicine = await Medicine.create({
      medicineName,
      description,
      image,
      category,
      brand,
      stockQuantity,
      price,
      expiryDate,
      isPrescriptionRequired,
      pharmacyId,
      pharmacistId: userId,
    });

    res.status(201).json({
      success: true,
      data: newlyCreatedMedicine,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while creating medicine",
    });
  }
};

// fetch all medicines
export const fetchAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: medicines,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching medicines",
    });
  }
};

// fetch all medicines by pharmacist
export const fetchAllMedicinesByPharmacist = async (req, res) => {
  try {
    const { pharmacistId } = req.params;

    if (!pharmacistId) {
      return res.status(400).json({
        success: false,
        message: "Pharmacist ID is required",
      });
    }

    const medicines = await Medicine.findAll({
      where: { pharmacistId },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: medicines,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching medicines",
    });
  }
};

// fetch medicines by pharmacy
export const getFilteredMedicinesByPharmacy = async (req, res) => {
  try {
    const { userId } = req.params;
    const { category = "", brand = "", sortBy = "price-lowtohigh" } = req.query;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user || user.role !== "pharmacist") {
      return res.status(403).json({
        success: false,
        message: "Only pharmacist can access this",
      });
    }
    console.log(`This is user id ${userId}`);
    console.log(`This is category ${category}`);
    console.log(`This is brand ${brand}`);
    console.log(`This is sortBy ${sortBy}`);

    // Get pharmacy owned by this pharmacist
    const pharmacy = await Pharmacy.findOne({
      where: { userId },
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy not found for this pharmacist",
      });
    }

    // Build filters
    let filters = {
      pharmacyId: pharmacy.pharmacyId,
    };

    if (category.length) {
      filters.category = {
        [Op.in]: category.split(","),
      };
      console.log(filters.category);
    }

    if (brand.length) {
      filters.brand = {
        [Op.in]: brand.split(","),
      };
    }

    // Sorting
    let sort = [];

    switch (sortBy) {
      case "price-lowtohigh":
        sort = [["price", "ASC"]];
        break;
      case "price-hightolow":
        sort = [["price", "DESC"]];
        break;
      case "title-atoz":
        sort = [["medicineName", "ASC"]];
        break;
      case "title-ztoa":
        sort = [["medicineName", "DESC"]];
        break;
      default:
        sort = [["price", "ASC"]];
        break;
    }

    // Fetch medicines
    const medicines = await Medicine.findAll({
      where: filters,
      order: sort,
    });

    res.status(200).json({
      success: true,
      data: medicines,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while filtering medicines",
    });
  }
};

// edit medicine details
export const editMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const {
      userId,
      medicineName,
      description,
      image,
      category,
      brand,
      stockQuantity,
      price,
      expiryDate,
      isPrescriptionRequired,
    } = req.body;

    const user = await User.findByPk(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.role !== "pharmacist")
      return res
        .status(403)
        .json({
          success: false,
          message: "Only pharmacists can edit medicine",
        });

    const medicine = await Medicine.findByPk(medicineId);
    if (!medicine)
      return res
        .status(404)
        .json({ success: false, message: "Medicine not found" });

    const pharmacy = await Pharmacy.findOne({
      where: {
        pharmacyId: medicine.pharmacyId,
        userId,
      },
    });

    if (!pharmacy)
      return res.status(403).json({
        success: false,
        message: "You do not own this medicine",
      });

    const updatedMedicine = await medicine.update({
      medicineName,
      description,
      image,
      category,
      brand,
      stockQuantity,
      price,
      expiryDate,
      isPrescriptionRequired,
    });

    res.status(200).json({
      success: true,
      data: updatedMedicine,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while editing medicine",
    });
  }
};

// delete medicine
export const deleteMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { userId } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only pharmacist can delete medicine
    if (user.role !== "pharmacist") {
      return res.status(403).json({
        success: false,
        message: "Only pharmacists can delete medicine",
      });
    }

    // Check if medicine exists
    const medicine = await Medicine.findByPk(medicineId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    const pharmacy = await Pharmacy.findOne({
      where: {
        pharmacyId: medicine.pharmacyId,
        userId,
      },
    });

    if (!pharmacy) {
      return res.status(403).json({
        success: false,
        message: "You do not own this medicine",
      });
    }

    // Delete medicine
    await medicine.destroy();

    res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting medicine",
    });
  }
};
