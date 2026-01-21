import { Op, fn, col, literal } from "sequelize";
import { db, sequelize } from "../../db/db.js";
import jwt from "jsonwebtoken";

const Medicine = db.Medicine;
const Order = db.Order;
const OrderItem = db.OrderItem;
const Pharmacy = db.Pharmacy;
const User = db.User;
const JWT_SECRET = "CLIENT_SECRET_KEY";

// Fetch revenue  stats
export const getRevenueStats = async (req, res) => {
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
    console.log("/////////////////////////////////////////");
    console.log(pharmacistId);
    // get pharmacies according to pharmacistId
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
    });
    console.log("check length of pharmacies");
    console.log(pharmacies.length);
    if (!pharmacies.length) {
      return res.json({
        revenue: { thisMonth: 0, growthPercentage: 0 },
        orders: { thisMonth: 0, growthPercentage: 0 },
        averageOrderValue: 0,
        topSellingCategory: null,
      });
    }

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);
    console.log(pharmacyIds);

    // date ranges
    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date(startOfThisMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const endOfLastMonth = new Date(startOfThisMonth);
    endOfLastMonth.setMilliseconds(-1);

    // revenue made this month
    const thisMonthRevenue =
      (await Order.sum("totalPrice", {
        where: {
          pharmacyId: { [Op.in]: pharmacyIds },
          status: "completed",
          createdAt: { [Op.gte]: startOfThisMonth },
        },
      })) || 0;

    const lastMonthRevenue =
      (await Order.sum("totalPrice", {
        where: {
          pharmacyId: { [Op.in]: pharmacyIds },
          status: "completed",
          createdAt: {
            [Op.between]: [startOfLastMonth, endOfLastMonth],
          },
        },
      })) || 0;

    const revenueGrowth =
      lastMonthRevenue === 0
        ? 100
        : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    // orders made this month
    const thisMonthOrders = await Order.count({
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        status: "completed",
        createdAt: { [Op.gte]: startOfThisMonth },
      },
    });

    const lastMonthOrders = await Order.count({
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        status: "completed",
        createdAt: {
          [Op.between]: [startOfLastMonth, endOfLastMonth],
        },
      },
    });

    const orderGrowth =
      lastMonthOrders === 0
        ? 100
        : ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;

    // average order value
    const averageOrderValue =
      thisMonthOrders === 0 ? 0 : thisMonthRevenue / thisMonthOrders;

    // top selling category
    const topCategory = await OrderItem.findAll({
      attributes: [
        [col("Medicine.category"), "category"],
        [
          fn("SUM", literal("OrderItem.price * OrderItem.quantity")),
          "totalSales",
        ],
      ],
      include: [
        {
          model: Order,
          attributes: [],
          where: {
            pharmacyId: { [Op.in]: pharmacyIds },
            status: "completed",
            createdAt: { [Op.gte]: startOfThisMonth },
          },
        },
        {
          model: Medicine,
          attributes: [],
        },
      ],
      group: ["Medicine.category"],
      order: [[literal("totalSales"), "DESC"]],
      limit: 1,
      raw: true,
    });
    console.log("//////// Dashboard Stats //////////");

    // Revenue
    console.log("This Month Revenue:", thisMonthRevenue);
    console.log("Last Month Revenue:", lastMonthRevenue);
    console.log("Revenue Growth %:", revenueGrowth);

    // Orders
    console.log("This Month Orders:", thisMonthOrders);
    console.log("Last Month Orders:", lastMonthOrders);
    console.log("Order Growth %:", orderGrowth);

    // Average Order Value
    console.log("Average Order Value:", averageOrderValue);

    // Top Selling Category
    console.log("Top Selling Category:", topCategory[0] || null);

    res.json({
      revenue: {
        thisMonth: Number(thisMonthRevenue),
        growthPercentage: Number(revenueGrowth.toFixed(2)),
      },
      orders: {
        thisMonth: thisMonthOrders,
        growthPercentage: Number(orderGrowth.toFixed(2)),
      },
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      topSellingCategory: topCategory[0] || null,
    });
  } catch (e) {
    console.log("Dashboard stats error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

// revenue made this month in each four weeks by the pharmacist
export const getRevenueTrend = async (req, res) => {
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
    console.log("/////////////////////////////////////////");
    console.log(pharmacistId);
    // get pharmacies of pharmacist
    const pharmacies = await db.Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
      raw: true,
    });

    if (!pharmacies.length) {
      return res.json([]);
    }

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // Date range for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(
      startOfMonth.getFullYear(),
      startOfMonth.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // Weekly revenue
    const revenueTrend = await db.Order.findAll({
      attributes: [
        [literal("FLOOR((DAY(created_at) - 1) / 7) + 1"), "week"],
        [fn("SUM", col("total_price")), "revenue"],
      ],
      where: {
        status: "completed",
        pharmacyId: { [Op.in]: pharmacyIds },
        created_at: { [Op.between]: [startOfMonth, endOfMonth] },
      },
      group: ["week"],
      order: [[literal("week"), "ASC"]],
      raw: true,
    });

    res.json(revenueTrend);
  } catch (e) {
    console.log("Revenue trend fetching error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

// top 5 categories by total sales amount
export const getTopSellingCategories = async (req, res) => {
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
    console.log("/////////////////////////////////////////");
    console.log(pharmacistId);
    // fetch all pharmacy
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
    });

    if (!pharmacies.length) {
      return res.json([]);
    }

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // aggregate category sales
    const categories = await OrderItem.findAll({
      attributes: [
        [col("Medicine.category"), "category"],
        [
          fn("SUM", literal("OrderItem.price * OrderItem.quantity")),
          "totalSales",
        ],
      ],
      include: [
        {
          model: Order,
          attributes: [],
          where: {
            pharmacyId: { [Op.in]: pharmacyIds },
            status: "completed",
          },
        },
        {
          model: Medicine,
          attributes: [],
        },
      ],
      group: ["Medicine.category"],
      order: [[literal("totalSales"), "DESC"]],
      // limit: 5, // no limits
      raw: true,
    });

    res.json(
      categories.map((c) => ({
        category: c.category,
        totalSales: Number(c.totalSales),
      }))
    );
  } catch (e) {
    console.log("error while fetching top 5 categories", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

// top selling medicines sold this month
export const getTopSellingMedicines = async (req, res) => {
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
    // Get all pharmacies of this pharmacist
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
      raw: true,
    });

    if (!pharmacies.length) return res.json([]);

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // Date ranges
    const now = new Date();

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59
    );

    // THIS MONTH sales
    const thisMonth = await OrderItem.findAll({
      attributes: [
        "medicineName",
        [
          fn("SUM", literal("OrderItem.price * OrderItem.quantity")),
          "thisMonthRevenue",
        ],
        [fn("SUM", col("OrderItem.quantity")), "totalStockSold"],
      ],
      include: [
        {
          model: Order,
          attributes: [],
          where: {
            pharmacyId: { [Op.in]: pharmacyIds },
            status: "completed",
            createdAt: { [Op.gte]: startOfThisMonth },
          },
        },
      ],
      group: ["medicineName"],
      raw: true,
    });

    // LAST MONTH sales
    const lastMonth = await OrderItem.findAll({
      attributes: [
        "medicineName",
        [
          fn("SUM", literal("OrderItem.price * OrderItem.quantity")),
          "lastMonthRevenue",
        ],
      ],
      include: [
        {
          model: Order,
          attributes: [],
          where: {
            pharmacyId: { [Op.in]: pharmacyIds },
            status: "completed",
            createdAt: {
              [Op.between]: [startOfLastMonth, endOfLastMonth],
            },
          },
        },
      ],
      group: ["medicineName"],
      raw: true,
    });

    // Merge & calculate growth
    const lastMonthMap = {};
    lastMonth.forEach((item) => {
      lastMonthMap[item.medicineName] = Number(item.lastMonthRevenue);
    });

    const result = thisMonth.map((item) => {
      const thisRevenue = Number(item.thisMonthRevenue);
      const lastRevenue = lastMonthMap[item.medicineName] || 0;

      const growthPercentage =
        lastRevenue === 0
          ? thisRevenue > 0
            ? 100
            : 0
          : ((thisRevenue - lastRevenue) / lastRevenue) * 100;

      return {
        medicineName: item.medicineName,
        thisMonthRevenue: thisRevenue,
        lastMonthRevenue: lastRevenue,
        growthPercentage: Math.round(growthPercentage),
        totalStockSold: Number(item.totalStockSold),
      };
    });

    // Sort by highest revenue
    const top5 = result
      .sort((a, b) => b.thisMonthRevenue - a.thisMonthRevenue)
      .slice(0, 5);

    res.json(top5);
  } catch (e) {
    console.log("Tog selling medicines error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

// recent transactions
export const getRecentCompletedTransactions = async (req, res) => {
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
    // Get all pharmacies of this pharmacist
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
      raw: true,
    });

    if (!pharmacies.length) return res.json([]);

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // Fetch recent completed orders
    const orders = await Order.findAll({
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        status: "completed",
        paymentMethod: { [Op.ne]: "cod" }, // remove cod
      },
      include: [
        {
          model: User,
          attributes: ["userName"],
        },
        {
          model: OrderItem,
          attributes: ["medicineName", "quantity", "price"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    const now = new Date();

    const result = orders.map((order) => {
      const orderTime = new Date(order.createdAt);
      const diffMs = now - orderTime;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);

      const timeAgo =
        diffHours > 0
          ? `${diffHours} hour(s) ago`
          : `${diffMinutes} minute(s) ago`;

      const topItems = (order.OrderItems || [])
        .sort((a, b) => b.quantity - a.quantity)
        .map((item) => `${item.medicineName} (x${item.quantity})`)
        .slice(0, 5);

      const totalStockBought = (order.OrderItems || []).reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        orderId: order.orderId,
        patientName: order.User?.userName || "Unknown",
        totalAmount: order.totalPrice,
        totalStockBought,
        topItems,
        createdAt: order.createdAt,
      };
    });

    res.json(result);
  } catch (e) {
    console.log("Recent transactions error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};
