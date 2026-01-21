import { Op, fn, col, literal } from "sequelize";
import { db, sequelize } from "../../db/db.js";
import jwt from "jsonwebtoken";

const Medicine = db.Medicine;
const Order = db.Order;
const OrderItem = db.OrderItem;
const Pharmacy = db.Pharmacy;
const User = db.User;
const PharmacyWithdrawl = db.PharmacyWithdrawl;
const JWT_SECRET = "CLIENT_SECRET_KEY";

//======================Overview========================
// Fetch all revenue stats for pharmacist dashboard
export const getRevenueStats = async (req, res) => {
  try {
    const cookies = req.cookies; // requesting cookies
    const token = req.cookies.token;
    //console.log("///////////////////////");
    //console.log(token);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Access the user ID directly, because you stored it as `id`
    const userId = decoded.id;
    const role = decoded.role;
    const email = decoded.email;
    //console.log(userId);
    const pharmacistId = userId;
    //console.log("/////////////////////////////////////////")
    //console.log(pharmacistId);
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
    //console.log(userId);
    const pharmacistId = userId;
    //console.log("/////////////////////////////////////////")
    //console.log(pharmacistId);
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
    //console.log("///////////////////////");
    //console.log(token);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Access the user ID directly, because you stored it as `id`
    const userId = decoded.id;
    const role = decoded.role;
    const email = decoded.email;
    //console.log(userId);
    const pharmacistId = userId;
    //console.log("/////////////////////////////////////////")
    //console.log(pharmacistId);
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
    //console.log("///////////////////////");
    //console.log(token);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Access the user ID directly, because you stored it as `id`
    const userId = decoded.id;
    const role = decoded.role;
    const email = decoded.email;
    //console.log(userId);
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
    // console.log("///////////////////////");
    // console.log(token);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Access the user ID directly, because you stored it as `id`
    const userId = decoded.id;
    const role = decoded.role;
    const email = decoded.email;
    // console.log(userId);
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

//======================End of Overview========================

// ( 2 )======================Earnings==============================
// Overview of earnings

export const getEarningsOverview = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const cookies = req.cookies; // requesting cookies
    const token = req.cookies.token;
    //console.log("///////////////////////");
    //console.log(token);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Access the user ID directly, because you stored it as `id`
    const userId = decoded.id;
    const role = decoded.role;
    const email = decoded.email;
    //console.log(userId);
    const pharmacistId = userId;
    //console.log("/////////////////////////////////////////")
    //console.log(pharmacistId);

    // get pharmacies
    // get pharmacist pharmacies
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
      raw: true,
    });

    if (!pharmacies.length) {
      return res.json({
        availableBalance: 0,
        pendingEarnings: 0,
        totalWithdrawn: 0,
        codDeducted: 0,
      });
    }

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // get completed orders only
    const orders = await Order.findAll({
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        status: "completed",
      },
      attributes: ["totalPrice", "paymentMethod", "withdrawlStatus"],
      raw: true,
    });

    let availableBalance = 0;
    let pendingEarnings = 0;
    let totalWithdrawn = 0;
    let codDeducted = 0;

    for (const order of orders) {
      const total = Number(order.totalPrice);
      const commission = total * 0.05;
      const net = total - commission;

      // COD logic
      if (order.paymentMethod === "cod") {
        codDeducted += net;
        continue;
      }

      // ONLINE logic
      switch (order.withdrawlStatus) {
        case "none":
          availableBalance += net;
          break;

        case "requested":
        case "processing":
          pendingEarnings += net;
          break;

        case "completed":
          totalWithdrawn += net;
          break;
      }
    }

    //console.log("Earnings Overview:");
    //console.log("Available Balance:", availableBalance);
    //console.log("Pending Earnings:", pendingEarnings);
    //console.log("Total Withdrawn:", totalWithdrawn);
    //console.log("COD Deducted:", codDeducted);
    res.json({
      availableBalance: Number(availableBalance.toFixed(2)),
      pendingEarnings: Number(pendingEarnings.toFixed(2)),
      totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
      codDeducted: Number(codDeducted.toFixed(2)),
    });
  } catch (e) {
    console.log("Earnings overview error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

// place withdrawl request
export const placeWithdrawlRequest = async (req, res) => {
  try {
    const cookies = req.cookies; // requesting cookies
    const token = req.cookies.token;
    //console.log("checktoken ///////////////////////");
    //console.log("checktoken", token);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Access the user ID directly, because you stored it as `id`
    const userId = decoded.id;
    const role = decoded.role;
    const email = decoded.email;
    //console.log(userId);
    const pharmacistId = userId;
    //console.log("/////////////////////////////////////////")
    //console.log("checking", pharmacistId);

    // get pharmacist pharmacies
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
      raw: true,
    });

    if (!pharmacies.length) {
      return res.status(400).json({ message: "No pharmacies found" });
    }

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // get eligible orders
    const orders = await Order.findAll({
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        status: "completed",
        withdrawlStatus: {
          [Op.or]: ["none", "rejected"],
        },
      },
      raw: true,
    });

    if (!orders.length) {
      return res
        .status(400)
        .json({ message: "No eligible orders for withdrawal" });
    }

    let totalAmount = 0;
    let totalCommission = 0;

    // calculate commission & net
    for (const order of orders) {
      const total = Number(order.totalPrice);
      const commission = total * 0.05; // 5% commission
      totalCommission += commission;

      if (order.paymentMethod === "cod") {
        // COD: 5% deducted, but amount not added to withdrawal
        totalAmount -= commission;
      } else {
        // ONLINE: 5% deducted, net added to withdrawal
        totalAmount += total - commission;
      }
    }

    // Create withdrawal record
    const withdrawal = await PharmacyWithdrawl.create({
      userId: pharmacistId,
      amount: totalAmount.toFixed(2),
      commissionAmount: totalCommission.toFixed(2),
      status: "requested",
    });

    // Update orders' withdrawl_status
    const orderIds = orders.map((o) => o.orderId);
    await Order.update(
      { withdrawlStatus: "requested" },
      { where: { orderId: { [Op.in]: orderIds } } }
    );

    res.status(200).json({
      success: true,
      message: "Withdrawl request placed successfully",
      withdrawalId: withdrawal.withdrawlId,
      totalAmount: totalAmount.toFixed(2),
      totalCommission: totalCommission.toFixed(2),
      ordersUpdated: orders.length,
    });
  } catch (e) {
    console.log("Place withdrawl request error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

// revenue by category this month
export const getMonthlyRevenueStats = async (req, res) => {
  try {
    const token = req.cookies.token;
    //console.log("checktoken ///////////////////////");
    //console.log("checktoken", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const pharmacistId = decoded.id;
    //console.log("Pharmacist ID:", pharmacistId);

    // Date range: current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Get pharmacies owned by pharmacist
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
      raw: true,
    });

    if (!pharmacies.length) {
      return res.status(200).json({
        success: true,
        data: {
          grossEarnings: 0,
          totalCommission: 0,
          netEarnings: 0,
          categories: [],
        },
      });
    }

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // Calculate gross earnings from orders directly
    const grossResult = await Order.findOne({
      attributes: [[fn("SUM", col("total_price")), "grossEarnings"]],
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        status: "completed",
        createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
      },
      raw: true,
    });

    const grossEarnings = Number(grossResult?.grossEarnings || 0);
    // console.log("Gross Earnings:", grossEarnings);

    // Get all completed orders for this month to get order IDs
    const orders = await Order.findAll({
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        status: "completed",
        createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
      },
      attributes: ["orderId", "totalPrice"], // Use model property name here
      raw: true,
    });

    const orderIds = orders.map((o) => o.orderId);
    // console.log("Order IDs found:", orderIds.length);

    let categories = [];

    if (orderIds.length > 0) {
      // CATEGORY-WISE SALES using a simpler approach
      const categorySales = await OrderItem.findAll({
        attributes: [
          [col("Medicine.category"), "category"],
          [
            fn("SUM", literal("OrderItem.price * OrderItem.quantity")),
            "totalSales",
          ],
        ],
        include: [
          {
            model: Medicine,
            attributes: [],
            required: true,
          },
        ],
        where: {
          orderId: { [Op.in]: orderIds },
        },
        group: ["Medicine.category"],
        order: [[literal("totalSales"), "DESC"]],
        raw: true,
      });

      // console.log("Category sales raw:", categorySales);

      // CATEGORY PERCENTAGES
      categories = categorySales.map((item) => ({
        category: item.category || "Uncategorized",
        totalSales: Number(item.totalSales) || 0,
        percentage:
          grossEarnings > 0
            ? +((Number(item.totalSales) / grossEarnings) * 100).toFixed(2)
            : 0,
      }));
    }

    // COMMISSION & NET
    const COMMISSION_RATE = 0.05;
    const totalCommission = +(grossEarnings * COMMISSION_RATE).toFixed(2);
    const netEarnings = +(grossEarnings - totalCommission).toFixed(2);

    /*
    console.log("Final data:", {
      grossEarnings,
      totalCommission,
      netEarnings,
      categories: categories.slice(0, 4)
    });
    */

    return res.status(200).json({
      success: true,
      data: {
        grossEarnings,
        totalCommission,
        netEarnings,
        categories: categories.slice(0, 4), // Top 4 only
      },
    });
  } catch (error) {
    console.error("Monthly Revenue Error:", error.message);
    console.error("SQL Error:", error.parent?.sqlMessage || error.sql);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly revenue stats",
    });
  }
};

// get withdrawl history
export const getWithdrawlHistory = async (req, res) => {
  try {
    const token = req.cookies.token;
    //console.log("checktoken ///////////////////////");
    //console.log("checktoken", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const pharmacistId = decoded.id;
    //console.log("Pharmacist ID:", pharmacistId);

    // Fetch withdrawal history for this pharmacist - limit to 5 most recent
    const withdrawals = await PharmacyWithdrawl.findAll({
      where: {
        userId: pharmacistId,
      },
      attributes: ["amount", "status", "paymentMethod", "updatedAt"],
      order: [["updatedAt", "DESC"]], // Most recently updated first
      limit: 5, // Limit to 5 records only
      raw: true,
    });

    // Format the response exactly as required
    const formattedWithdrawals = withdrawals.map((withdrawal) => ({
      amount: parseFloat(withdrawal.amount),
      status: withdrawal.status,
      paymentMethod: withdrawal.paymentMethod || "esewa",
      updatedAt: withdrawal.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      withdrawals: formattedWithdrawals,
    });
  } catch (e) {
    console.log("Withdrawal history fetching error", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token expired",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// provide revenue of today but can filter by day, default should be today
export const getDailyRevenue = async (req, res) => {
  try {
    //console.log("/////////Get daily revenue/////////");
    const token = req.cookies.token;
    //console.log("checktoken ///////////////////////");
    //console.log("checktoken", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const pharmacistId = decoded.id;
    //console.log("/////////////////////////////////////////");
    //console.log("Pharmacist ID:", pharmacistId);

    // DATE (from body, default today)
    const { date } = req.body;
    const today = date ? new Date(date) : new Date();

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // YESTERDAY
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const endOfYesterday = new Date(endOfToday);
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);

    // PHARMACIES
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
      raw: true,
    });

    if (!pharmacies.length) {
      return res.status(400).json({ message: "No pharmacy found" });
    }

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // TODAY STATS
    const todayStats = await Order.findOne({
      attributes: [
        [fn("SUM", col("total_price")), "todayRevenue"],
        [fn("COUNT", col("order_id")), "todayOrders"],
      ],
      where: {
        status: "completed",
        pharmacy_id: {
          [Op.in]: pharmacyIds,
        },
        created_at: {
          [Op.between]: [startOfToday, endOfToday],
        },
      },
      raw: true,
    });

    const todayRevenue = Number(todayStats?.todayRevenue || 0);
    const todayOrders = Number(todayStats?.todayOrders || 0);

    // YESTERDAY STATS
    const yesterdayStats = await Order.findOne({
      attributes: [
        [fn("SUM", col("total_price")), "yesterdayRevenue"],
        [fn("COUNT", col("order_id")), "yesterdayOrders"],
      ],
      where: {
        status: "completed",
        pharmacy_id: {
          [Op.in]: pharmacyIds,
        },
        created_at: {
          [Op.between]: [startOfYesterday, endOfYesterday],
        },
      },
      raw: true,
    });

    const yesterdayRevenue = Number(yesterdayStats?.yesterdayRevenue || 0);
    const yesterdayOrders = Number(yesterdayStats?.yesterdayOrders || 0);

    // SALES LAST 24 HOURS
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const last24Result = await Order.findOne({
      attributes: [[fn("SUM", col("total_price")), "salesLast24Hours"]],
      where: {
        status: "completed",
        pharmacy_id: {
          [Op.in]: pharmacyIds,
        },
        created_at: {
          [Op.gte]: last24Hours,
        },
      },
      raw: true,
    });

    const salesLast24Hours = Number(last24Result?.salesLast24Hours || 0);

    // HOURLY SALES (FOR PEAK + SLOTS)
    const hourlySales = await Order.findAll({
      attributes: [
        [fn("HOUR", col("created_at")), "hour"],
        [fn("SUM", col("total_price")), "sales"],
      ],
      where: {
        status: "completed",
        pharmacy_id: {
          [Op.in]: pharmacyIds,
        },
        created_at: {
          [Op.between]: [startOfToday, endOfToday],
        },
      },
      group: [fn("HOUR", col("created_at"))],
      raw: true,
    });

    // PEAK HOUR
    let peakHour = null;
    let peakHourSales = 0;

    if (hourlySales.length) {
      const peak = hourlySales.reduce((max, curr) =>
        Number(curr.sales) > Number(max.sales) ? curr : max
      );
      peakHour = Number(peak.hour);
      peakHourSales = Number(peak.sales);
    }

    // SPECIFIC TIME SLOTS
    const timeSlots = [6, 9, 12, 15, 18, 21];
    const timeSlotSales = {};

    timeSlots.forEach((hour) => {
      const found = hourlySales.find((h) => Number(h.hour) === hour);
      timeSlotSales[`${hour}:00`] = found ? Number(found.sales) : 0;
    });

    //  GROWTH
    const orderGrowthPercentage =
      yesterdayOrders === 0
        ? 100
        : Number(
            (((todayOrders - yesterdayOrders) / yesterdayOrders) * 100).toFixed(
              2
            )
          );

    const revenueGrowthPercentage =
      yesterdayRevenue === 0
        ? 100
        : Number(
            (
              ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) *
              100
            ).toFixed(2)
          );

    // FINAL RESPONSE
    return res.status(200).json({
      success: true,
      data: {
        salesLast24Hours,
        peakHour,
        peakHourSales,
        todayOrders,
        orderGrowthPercentage,
        todayRevenue,
        revenueGrowthPercentage,
        timeSlotSales,
      },
    });
  } catch (e) {
    console.log("Daily revenue fetching error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getWeeklyRevenue = async (req, res) => {
  try {
    //console.log("/////////Get daily revenue/////////");
    const token = req.cookies.token;
    //console.log("checktoken ///////////////////////");
    //console.log("checktoken", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const pharmacistId = decoded.id;
    //console.log("/////////////////////////////////////////");
    //console.log("Pharmacist ID:", pharmacistId);

    // PHARMACIES
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
      raw: true,
    });

    if (!pharmacies.length) {
      return res.status(400).json({ message: "No pharmacy found" });
    }

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // FILTER DATE FROM BODY OR DEFAULT THIS WEEK
    const { date } = req.body;
    const today = date ? new Date(date) : new Date();

    // Get start of week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay(); // 0=Sunday, 1=Monday ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // if Sunday, go back 6
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // End of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // FETCH ORDERS THIS WEEK
    const orders = await Order.findAll({
      where: {
        pharmacyId: pharmacyIds,
        status: "completed",
        createdAt: {
          [Op.between]: [startOfWeek, endOfWeek],
        },
      },
      attributes: ["total_price", "created_at"],
      raw: true,
    });

    // INITIALIZE DAILY DATA
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const weekData = days.map((day, index) => ({
      day,
      revenue: 0,
      orders: 0,
    }));

    // AGGREGATE ORDERS
    orders.forEach((order) => {
      const orderDate = new Date(order.created_at);
      const orderDay = orderDate.getDay(); // 0=Sunday, 1=Monday
      const index = orderDay === 0 ? 6 : orderDay - 1; // Sunday=6
      weekData[index].revenue += Number(order.total_price);
      weekData[index].orders += 1;
    });

    // TOTAL REVENUE AND ORDERS
    const totalRevenue = weekData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = weekData.reduce((sum, d) => sum + d.orders, 0);

    // COMMISSION 5%
    const commissionRate = 0.05;
    const totalCommission = Number((totalRevenue * commissionRate).toFixed(2));

    // NET EARNINGS
    const netEarnings = Number((totalRevenue - totalCommission).toFixed(2));

    // BEST DAY (MAX REVENUE)
    const maxRevenue = Math.max(...weekData.map((d) => d.revenue));
    const bestDays = weekData
      .filter((d) => d.revenue === maxRevenue && maxRevenue > 0)
      .map((d) => d.day);

    return res.status(200).json({
      success: true,
      data: {
        weekData,
        totalRevenue,
        totalOrders,
        totalCommission,
        netEarnings,
        bestDays,
      },
    });
  } catch (e) {
    console.log("Weekly revenue fetching error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  try {
    console.log("/////////Get daily revenue/////////");
    const token = req.cookies.token;
    console.log("checktoken ///////////////////////");
    console.log("checktoken", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const pharmacistId = decoded.id;
    //const pharmacistId = 4;
    console.log("/////////////////////////////////////////");
    console.log("Pharmacist ID:", pharmacistId);

    // PHARMACIES
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
      raw: true,
    });

    if (!pharmacies.length) {
      return res.status(400).json({ message: "No pharmacy found" });
    }

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    if (!pharmacyIds.length)
      return res.status(400).json({ message: "No pharmacy found" });

    // Month & year from body or default to current
    const { month, year, date } = req.body;
    const selectedDate = date
      ? new Date(date + "-01")
      : month && year
      ? new Date(year, month - 1, 1)
      : new Date();
    const startOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    //console.log(req.body);
    // Total revenue
    const totalRevenueData = await Order.findAll({
      where: {
        pharmacy_id: pharmacyIds,
        status: "completed",
        order_date: { [Op.between]: [startOfMonth, endOfMonth] },
      },
      attributes: [
        [fn("SUM", col("total_price")), "monthlyRevenue"],
        [fn("COUNT", col("order_id")), "totalOrders"],
      ],
      raw: true,
    });

    const monthlyRevenue = Number(totalRevenueData[0].monthlyRevenue || 0);
    const totalOrders = Number(totalRevenueData[0].totalOrders || 0);

    // Total items sold
    const totalItemsSoldData = await OrderItem.findAll({
      include: [
        {
          model: Order,
          where: {
            pharmacy_id: pharmacyIds,
            status: "completed",
            created_at: { [Op.between]: [startOfMonth, endOfMonth] },
          },
          attributes: [],
        },
      ],
      attributes: [[fn("SUM", col("quantity")), "totalItemsSold"]],
      raw: true,
    });

    const totalItemsSold = Number(totalItemsSoldData[0].totalItemsSold || 0);

    // Commission & net earnings
    const totalCommission = monthlyRevenue * 0.05;
    const netEarnings = monthlyRevenue - totalCommission;

    // Weekly revenue (simplest approach: split by 4 weeks)
    const weeklyRevenue = [];
    for (let i = 0; i < 4; i++) {
      const startWeek = new Date(startOfMonth);
      startWeek.setDate(1 + i * 7);

      const endWeek = new Date(startOfMonth);
      endWeek.setDate(
        (i + 1) * 7 > endOfMonth.getDate() ? endOfMonth.getDate() : (i + 1) * 7
      );

      const weekRevenueData = await Order.findAll({
        where: {
          pharmacy_id: pharmacyIds,
          status: "completed",
          order_date: { [Op.between]: [startWeek, endWeek] },
        },
        attributes: [[fn("SUM", col("total_price")), "revenue"]],
        raw: true,
      });

      weeklyRevenue.push({
        week: i + 1,
        revenue: Number(weekRevenueData[0].revenue || 0),
      });
    }

    // Best week
    const bestWeek = weeklyRevenue.reduce(
      (max, w) => (w.revenue > max.revenue ? w : max),
      weeklyRevenue[0]
    ).week;

    const prevMonthDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 1,
      1
    );
    const startOfPrevMonth = new Date(
      prevMonthDate.getFullYear(),
      prevMonthDate.getMonth(),
      1
    );
    const endOfPrevMonth = new Date(
      prevMonthDate.getFullYear(),
      prevMonthDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // Total revenue previous month
    const prevRevenueData = await Order.findAll({
      where: {
        pharmacy_id: pharmacyIds,
        status: "completed",
        order_date: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] },
      },
      attributes: [[fn("SUM", col("total_price")), "monthlyRevenue"]],
      raw: true,
    });

    const prevMonthRevenue = Number(prevRevenueData[0].monthlyRevenue || 0);

    // Calculate growth percentage safely
    let growthPercentage = null;
    if (prevMonthRevenue > 0) {
      growthPercentage =
        ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
      growthPercentage = Number(growthPercentage.toFixed(2)); // optional: round to 2 decimals
    }
    //console.log(growthPercentage);
    res.status(200).json({
      success: true,
      data: {
        monthlyRevenue,
        weeklyRevenue,
        totalOrders,
        totalItemsSold,
        bestWeek,
        totalCommission,
        netEarnings,
        growthPercentage,
      },
    });
  } catch (e) {
    console.log("Monthly revenue fetching error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};
