import { db } from "../../db/db.js";

const Pharmacy = db.Pharmacy;
const User = db.User;

// add the pharmacy
export const addPharmacy = async (req, res) => {
  try {
    const {
      userId,
      pharmacyName,
      address,
      licenseNumber,
      contactNumber,
      deliveryAvailable,
    } = req.body;

    //Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Ensure only pharmacist can add pharmacy
    if (user.role !== "pharmacist") {
      return res.status(403).json({
        success: false,
        message: "Only pharmacists can create a pharmacy",
      });
    }

    // Prevent duplicate pharmacy for same user
    // as one user can have multiple pharmacies, this check is commented out
    /*
    const existingPharmacy = await Pharmacy.findOne({
      where: { userId }
    });

    if (existingPharmacy) {
      return res.status(400).json({
        success: false,
        message: "Pharmacy already exists for this user"
      });
    }

    */

    // Check if license number already exists
    const existingLicense = await Pharmacy.findOne({
      where: { licenseNumber },
    });

    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: "License number already exists",
      });
    }

    // Correct Sequelize create
    const newlyCreatedPharmacy = await Pharmacy.create({
      userId,
      pharmacyName,
      address,
      licenseNumber,
      contactNumber,
      deliveryAvailable,
    });

    res.status(201).json({
      success: true,
      data: newlyCreatedPharmacy,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while creating pharmacy",
    });
  }
};

// fetch all pharmacies
export const fetchAllPharmaciesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is required!",
      });
    }

    const pharmacyList = await Pharmacy.findAll({
      where: { userId },
    });

    res.status(200).json({
      success: true,
      data: pharmacyList,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

// edit pharmacy details
export const editPharmacy = async (req, res) => {
  try {
    const { userId, pharmacyId } = req.params;
    const formData = req.body;

    if (!userId || !pharmacyId) {
      return res.status(400).json({
        success: false,
        message: "User and Pharmacy id is required!",
      });
    }

    const [updated] = await Pharmacy.update(formData, {
      where: {
        pharmacyId,
        userId,
      },
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy not found!",
      });
    }

    const updatedPharmacy = await Pharmacy.findOne({
      where: { pharmacyId },
    });

    res.status(200).json({
      success: true,
      data: updatedPharmacy,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

export const deletePharmacy = async (req, res) => {
  try {
    const { userId, pharmacyId } = req.params;

    if (!userId || !pharmacyId) {
      return res.status(400).json({
        success: false,
        message: "User and Pharmacy id is required!",
      });
    }

    const deleted = await Pharmacy.destroy({
      where: {
        pharmacyId,
        userId,
      },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pharmacy deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

// Get pharmacy by ID
export const fetchPharmacyById = async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    if (!pharmacyId) {
      return res.status(400).json({
        success: false,
        message: "Pharmacy id is required!",
      });
    }

    const pharmacy = await Pharmacy.findByPk(pharmacyId);

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: pharmacy,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error fetching pharmacy",
    });
  }
};
