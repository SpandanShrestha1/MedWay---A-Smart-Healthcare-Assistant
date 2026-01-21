import { Op } from "sequelize";
import { db } from "../../db/db.js";
import jwt from "jsonwebtoken";

const Medicine = db.Medicine;
const Order = db.Order;
const OrderItem = db.OrderItem;
const Pharmacy = db.Pharmacy;
const User = db.User;
const JWT_SECRET = "CLIENT_SECRET_KEY";

// Fetch all dashboard stats
const getPharmacyDashboardStats = async (req, res) => {
  try {
    const cookies = req.cookies; // requesting cookies
    const token = req.cookies.token;
    console.log("///////////////////////");
    console.log(token);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Access the user ID directly, because you stored it as `id`
    const userId = decoded.id;
    const role = decoded.role;
    const email = decoded.email;
    console.log(userId);
    const pharmacistId = userId;
    // Get all pharmacies for this pharmacist
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
    });

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // If no pharmacies found, return zeros
    if (pharmacyIds.length === 0) {
      return res.json({
        pendingOrders: 0,
        lowStockCount: 0,
        todaySalesCount: 0,
        totalItemsCount: 0,
      });
    }

    // Set up date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const pendingOrders = await Order.count({
      where: { pharmacyId: { [Op.in]: pharmacyIds }, status: "pending" },
    });

    const lowStockCount = await Medicine.count({
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        stockQuantity: { [Op.lt]: 10 },
      },
    });

    // Today's completed orders
    const todaySalesCount = await Order.count({
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        status: "completed",
        orderDate: { [Op.gte]: today, [Op.lt]: tomorrow },
      },
    });

    // Yesterday's completed orders
    const yesterdaySalesCount = await Order.count({
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        status: "completed",
        orderDate: { [Op.gte]: yesterday, [Op.lt]: today },
      },
    });

    // Calculate percentage change
    let salesChangePercent = 0;
    if (yesterdaySalesCount > 0) {
      salesChangePercent =
        ((todaySalesCount - yesterdaySalesCount) / yesterdaySalesCount) * 100;
    } else if (todaySalesCount > 0) {
      // Yesterday had 0 sales, so today’s sales are 100% increase
      salesChangePercent = 100;
    }

    const totalItemsCount = await Medicine.count({
      where: { pharmacyId: { [Op.in]: pharmacyIds } },
    });

    return res.json({
      pendingOrders,
      lowStockCount,
      todaySalesCount,
      salesChangePercent: salesChangePercent.toFixed(2),
      totalItemsCount,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getRecentOrders = async (req, res) => {
  try {
    const cookies = req.cookies;
    const token = req.cookies.token;
    console.log("///////////////////////");
    console.log(token);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Access the user ID directly, because you stored it as `id`
    const userId = decoded.id;
    const role = decoded.role;
    const email = decoded.email;
    console.log(userId);
    const pharmacistId = userId;

    // Get all pharmacies for this pharmacist
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
    });

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // If no pharmacies, return empty array
    if (pharmacyIds.length === 0) {
      return res.json([]);
    }

    const recentOrders = await Order.findAll({
      where: { pharmacyId: { [Op.in]: pharmacyIds } },
      include: [
        { model: OrderItem, as: "OrderItems", attributes: ["quantity"] },
        {
          model: User,
          attributes: ["userName"],
        },
      ],
      order: [["orderDate", "DESC"]],
      limit: 10,
    });

    const formatted = recentOrders.map((order) => ({
      orderId: order.orderId,
      status: order.status,
      totalPrice: order.totalPrice,
      itemsCount: order.OrderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      patientUserName: order.User?.userName || "Unknown",
      timeAgo: order.orderDate,
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Recent orders error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getLowStockAlerts = async (req, res) => {
  try {
    const cookies = req.cookies;
    const token = req.cookies.token;
    console.log("///////////////////////");
    console.log(token);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Access the user ID directly, because you stored it as `id`
    const userId = decoded.id;
    const role = decoded.role;
    const email = decoded.email;
    console.log(userId);
    const pharmacistId = userId;

    // Get all pharmacies for this pharmacist
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
    });

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // If no pharmacies, return empty array
    if (pharmacyIds.length === 0) {
      return res.json([]);
    }

    const lowStock = await Medicine.findAll({
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        stockQuantity: { [Op.lt]: 100 },
      },
      attributes: ["medicineId", "medicineName", "stockQuantity"],
      order: [["stockQuantity", "ASC"]],
    });

    const formatted = lowStock.map((med) => ({
      medicineId: med.medicineId,
      medicineName: med.medicineName,
      stockQuantity: med.stockQuantity,
      min: 100,
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Low stock alerts error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default {
  getPharmacyDashboardStats,
  getRecentOrders,
  getLowStockAlerts,
};
