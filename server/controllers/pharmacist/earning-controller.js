import { Op, fn, col, literal } from "sequelize";
import { db, sequelize } from "../../db/db.js";
import jwt from "jsonwebtoken";

const Medicine = db.Medicine;
const Order = db.Order;
const OrderItem = db.OrderItem;
const Pharmacy = db.Pharmacy;
const User = db.User;
const PharmacyWithdrawl = db.PharmacyWithdrawl;
const PaymentMethod = db.PaymentMethod;
const JWT_SECRET = "CLIENT_SECRET_KEY";

export const EarningPageStats = async (req, res) => {
  try {
    // fetching pharmacist id from cookies
    const cookies = req.cookies;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const pharmacistId = userId;

    // fetching all pharmacies
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
      raw: true,
    });

    if (!pharmacies.length) {
      return res.json({
        success: true,
        data: {
          availableBalance: 0,
          pendingEarnings: 0,
          processingPayouts: 0,
          totalWithdrawn: 0,
          successfulWithdrawals: 0,
          successfulWithdrawalCount: 0,
          totalRequestedWithdrawals: 0,
          requestedWithdrawalCount: 0,
          codDeducted: 0,
          recentWithdrawals: [],
        },
      });
    }

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // get completed orders only - EXCLUDE COD orders from withdrawal calculations
    const orders = await Order.findAll({
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        status: "completed",
        // Exclude COD orders from withdrawal calculations
        [Op.or]: [
          { paymentMethod: { [Op.ne]: "cod" } },
          { paymentMethod: { [Op.is]: null } },
        ],
      },
      attributes: [
        "totalPrice",
        "paymentMethod",
        "withdrawlStatus",
        "createdAt",
      ],
      raw: true,
    });

    // COD orders separately just for counting COD commission
    const codOrders = await Order.findAll({
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        status: "completed",
        paymentMethod: "cod",
      },
      attributes: ["totalPrice"],
      raw: true,
    });

    let availableBalance = 0;
    let pendingEarnings = 0;
    let processingPayouts = 0;
    let codDeducted = 0;

    // COD commission from COD orders only
    for (const order of codOrders) {
      const total = Number(order.totalPrice) || 0;
      const commission = total * 0.05;
      codDeducted += commission;
    }

    // Process only non-COD orders for withdrawal/earning calculations
    for (const order of orders) {
      const total = Number(order.totalPrice) || 0;
      const commission = total * 0.05;
      const net = total - commission;

      // Handle withdrawal status logic (only for non-COD orders)
      switch (order.withdrawlStatus) {
        case "none":
          availableBalance += net;
          break;

        case "requested":
          pendingEarnings += net;
          processingPayouts += net;
          break;

        case "processing":
          pendingEarnings += net;
          processingPayouts += net;
          break;

        case "completed":
          // Already withdrawn - handled by withdrawal table
          break;

        default:
          availableBalance += net;
          break;
      }
    }

    // withdrawal statistics from PharmacyWithdrawl table
    const withdrawals = await PharmacyWithdrawl.findAll({
      where: {
        userId: pharmacistId,
      },
      raw: true,
    });

    let totalWithdrawn = 0;
    let successfulWithdrawals = 0;
    let pendingWithdrawals = 0;
    let totalRequestedWithdrawals = 0;
    let requestedWithdrawalCount = 0;

    for (const withdrawal of withdrawals) {
      const amount = Number(withdrawal.amount) || 0;
      const commissionAmount = Number(withdrawal.commission_amount) || 0;
      const netAmount = amount + commissionAmount; // Total amount that was withdrawn

      if (withdrawal.status === "completed") {
        totalWithdrawn += netAmount;
        successfulWithdrawals += netAmount;
      } else if (
        withdrawal.status === "requested" ||
        withdrawal.status === "processing"
      ) {
        pendingWithdrawals += netAmount;
        totalRequestedWithdrawals += netAmount;
        if (withdrawal.status === "requested") {
          requestedWithdrawalCount++;
        }
      }
    }

    // pendingEarnings to exclude amounts that are in withdrawal requests
    pendingEarnings = Math.max(0, pendingEarnings - pendingWithdrawals);

    // get count of successful withdrawal transactions
    const successfulWithdrawalCount = await PharmacyWithdrawl.count({
      where: {
        userId: pharmacistId,
        status: "completed",
      },
    });

    // Get recent withdrawal history
    const recentWithdrawals = await PharmacyWithdrawl.findAll({
      where: {
        userId: pharmacistId,
      },
      order: [["updatedAt", "DESC"]],
      limit: 5,
      raw: true,
    });

    // returning calculated statistics
    return res.json({
      success: true,
      data: {
        availableBalance: Math.round(availableBalance * 100) / 100,
        pendingEarnings: Math.round(pendingEarnings * 100) / 100,
        processingPayouts: Math.round(processingPayouts * 100) / 100,
        totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
        successfulWithdrawals: Math.round(successfulWithdrawals * 100) / 100,
        successfulWithdrawalCount: successfulWithdrawalCount,
        totalRequestedWithdrawals:
          Math.round(totalRequestedWithdrawals * 100) / 100,
        requestedWithdrawalCount: requestedWithdrawalCount,
        codDeducted: Math.round(codDeducted * 100) / 100,
        recentWithdrawals: recentWithdrawals,
      },
    });
  } catch (error) {
    console.error("Error in EarningPageStats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const EarningBreakdown = async (req, res) => {
  try {
    const cookies = req.cookies; // requesting cookies
    const token = req.cookies.token;
    const decoded = jwt.verify(token, JWT_SECRET);

    // Access the user ID directly, because you stored it as `id`
    const userId = decoded.id;
    const role = decoded.role;
    const email = decoded.email;
    const pharmacistId = userId;

    // fetch all pharmacy
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
    });

    if (!pharmacies.length) {
      return res.json({
        success: true,
        categories: [],
        totalSales: 0,
      });
    }

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // Step 1: Get total sales first
    const totalSalesResult = await OrderItem.findAll({
      attributes: [
        [
          fn("SUM", literal("OrderItem.price * OrderItem.quantity")),
          "totalAllSales",
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
      ],
      raw: true,
    });

    const totalSales = Number(totalSalesResult[0]?.totalAllSales || 0);

    // Step 2: aggregate category sales
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
      raw: true,
    });

    // Calculate percentage for each category
    const categoriesWithPercentage = categories.map((c) => {
      const sales = Number(c.totalSales) || 0;
      const percentage = totalSales > 0 ? (sales / totalSales) * 100 : 0;

      return {
        category: c.category,
        totalSales: sales,
        percentage: parseFloat(percentage.toFixed(2)), // Round to 2 decimal places
      };
    });

    res.json({
      success: true,
      categories: categoriesWithPercentage,
      totalSales: totalSales,
    });
  } catch (e) {
    console.log("error while fetching categories breakdown", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e.message,
    });
  }
};

export const EarningMonthlySummary = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    const pharmacistId = decoded.id;

    // fetch all pharmacies for this pharmacist
    const pharmacies = await Pharmacy.findAll({
      where: { userId: pharmacistId },
      attributes: ["pharmacyId"],
      raw: true,
    });

    if (!pharmacies.length) {
      return res.json({
        success: true,
        monthlyData: [],
      });
    }

    const pharmacyIds = pharmacies.map((p) => p.pharmacyId);

    // Calculate date range: last 5 months
    const currentDate = new Date();
    const firstDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    // Get first day of 5 months ago
    const fiveMonthsAgo = new Date(currentDate);
    fiveMonthsAgo.setMonth(currentDate.getMonth() - 4); // -4 gives us 5 months total

    // Generate array of last 5 months
    const months = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM
      const monthName = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      months.push({
        month: monthStr,
        monthName: monthName,
        totalOrders: 0,
        totalRevenue: 0,
        netEarnings: 0,
        totalWithdrawn: 0,
      });
    }

    // Get monthly order statistics for last 5 months
    const monthlyOrders = await Order.findAll({
      attributes: [
        [literal("DATE_FORMAT(created_at, '%Y-%m')"), "month"],
        [fn("COUNT", col("order_id")), "totalOrders"],
        [fn("SUM", col("total_price")), "totalRevenue"],
        [fn("SUM", literal("total_price * 0.95")), "netEarnings"],
      ],
      where: {
        pharmacyId: { [Op.in]: pharmacyIds },
        status: "completed",
        createdAt: {
          [Op.gte]: fiveMonthsAgo,
          [Op.lte]: currentDate,
        },
      },
      group: ["month"],
      order: [["month", "DESC"]],
      raw: true,
    });

    // Get monthly withdrawal statistics for last 5 months
    const monthlyWithdrawals = await PharmacyWithdrawl.findAll({
      attributes: [
        [literal("DATE_FORMAT(created_at, '%Y-%m')"), "month"],
        [
          fn(
            "SUM",
            literal("CASE WHEN status = 'completed' THEN amount ELSE 0 END")
          ),
          "totalWithdrawn",
        ],
      ],
      where: {
        userId: pharmacistId,
        status: "completed",
        createdAt: {
          [Op.gte]: fiveMonthsAgo,
          [Op.lte]: currentDate,
        },
      },
      group: ["month"],
      order: [["month", "DESC"]],
      raw: true,
    });

    // Create a map for quick lookup
    const orderMap = new Map();
    monthlyOrders.forEach((order) => {
      orderMap.set(order.month, {
        totalOrders: parseInt(order.totalOrders) || 0,
        totalRevenue: parseFloat(order.totalRevenue) || 0,
        netEarnings: parseFloat(order.netEarnings) || 0,
      });
    });

    const withdrawalMap = new Map();
    monthlyWithdrawals.forEach((withdrawal) => {
      withdrawalMap.set(withdrawal.month, {
        totalWithdrawn: parseFloat(withdrawal.totalWithdrawn) || 0,
      });
    });

    // Populate the months array with actual data
    const result = months.map((month) => {
      const orderData = orderMap.get(month.month) || {
        totalOrders: 0,
        totalRevenue: 0,
        netEarnings: 0,
      };
      const withdrawalData = withdrawalMap.get(month.month) || {
        totalWithdrawn: 0,
      };

      return {
        ...month,
        totalOrders: orderData.totalOrders,
        totalRevenue: orderData.totalRevenue,
        netEarnings: orderData.netEarnings,
        totalWithdrawn: withdrawalData.totalWithdrawn,
      };
    });

    res.json({
      success: true,
      monthlyData: result,
    });
  } catch (e) {
    console.log("error while fetching earning monthly summary", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e.message,
    });
  }
};

// get completed withdrawl payment history for pharmacist
export const getCompletedWithdrawlHistory = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const pharmacistId = decoded.id;

    // Get filter from query parameters
    const { paymentMethod = "all", limit = 5 } = req.query;

    console.log("Payment method filter:", paymentMethod); // Debug log

    // Validate paymentMethod filter
    const validPaymentMethods = ["all", "bank", "esewa"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method filter. Valid options: all, bank, esewa",
      });
    }

    // Validate limit
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a number between 1 and 50",
      });
    }

    // Build where clause - ALWAYS include completed status
    const whereClause = {
      userId: pharmacistId,
      status: "completed", // Only completed withdrawals
    };

    // Add payment method filter if not 'all'
    if (paymentMethod !== "all") {
      // Map user-friendly payment method to database values
      const paymentMethodMap = {
        bank: ["bank", "bank_transfer", "bank-transfer", "bank transfer"],
        esewa: ["esewa", "e-sewa", "esewa_wallet"],
      };

      whereClause.paymentMethod = {
        [Op.or]: paymentMethodMap[paymentMethod] || [paymentMethod],
      };
    }

    console.log("Where clause:", JSON.stringify(whereClause)); // Debug log

    // Fetch withdrawal history
    const withdrawals = await PharmacyWithdrawl.findAll({
      where: whereClause,
      attributes: [
        "withdrawlId",
        "amount",
        "status",
        "paymentMethod",
        "commissionAmount",
        "updatedAt",
        "createdAt",
      ],
      order: [["updatedAt", "DESC"]],
      limit: parsedLimit,
      raw: true,
    });

    console.log("Found withdrawals:", withdrawals.length); // Debug log

    // Format response - SAFELY access properties
    const formattedWithdrawals = withdrawals.map((withdrawal) => {
      // Use default values if properties are undefined
      const amount = parseFloat(withdrawal?.amount || 0);
      const commissionAmount = parseFloat(withdrawal?.commissionAmount || 0);
      const paymentMethodValue = withdrawal?.paymentMethod || "esewa";

      return {
        withdrawlId: withdrawal?.withdrawlId,
        amount: amount,
        commissionAmount: commissionAmount,
        netAmount: amount - commissionAmount,
        status: withdrawal?.status || "completed",
        paymentMethod: paymentMethodValue,
        updatedAt: withdrawal?.updatedAt,
        createdAt: withdrawal?.createdAt,
        formattedDate: withdrawal?.updatedAt
          ? new Date(withdrawal.updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "N/A",
      };
    });

    // Calculate summary statistics
    const totalAmount = formattedWithdrawals.reduce(
      (sum, w) => sum + w.amount,
      0
    );
    const totalCommission = formattedWithdrawals.reduce(
      (sum, w) => sum + w.commissionAmount,
      0
    );
    const totalNetAmount = formattedWithdrawals.reduce(
      (sum, w) => sum + w.netAmount,
      0
    );

    return res.status(200).json({
      success: true,
      metadata: {
        count: withdrawals.length,
        limit: parsedLimit,
        filter: {
          paymentMethod: paymentMethod,
        },
      },
      summary: {
        totalAmount: totalAmount,
        totalCommission: totalCommission,
        totalNetAmount: totalNetAmount,
        averageAmount:
          withdrawals.length > 0 ? totalAmount / withdrawals.length : 0,
      },
      withdrawals: formattedWithdrawals,
    });
  } catch (error) {
    console.log("Withdrawal history fetching error details:", error);
    console.log("Error stack:", error.stack);

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

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// get all withdrawls which status is requested
export const getRequestedWithdrawlHistory = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const pharmacistId = decoded.id;

    // Build where clause - only requested status
    const whereClause = {
      userId: pharmacistId,
      status: "requested", // Only requested withdrawals
    };

    // Fetch withdrawal history
    const withdrawals = await PharmacyWithdrawl.findAll({
      where: whereClause,
      attributes: [
        "withdrawlId",
        "amount",
        "status",
        "paymentMethod",
        "commissionAmount",
        "updatedAt",
        "createdAt",
      ],
      order: [["updatedAt", "DESC"]], // Most recent first
      raw: true,
    });

    console.log("Found requested withdrawals:", withdrawals.length);

    // Format response
    const formattedWithdrawals = withdrawals.map((withdrawal) => {
      const amount = parseFloat(withdrawal?.amount || 0);
      const commissionAmount = parseFloat(withdrawal?.commissionAmount || 0);
      const paymentMethodValue = withdrawal?.paymentMethod || "esewa";

      return {
        id: withdrawal?.withdrawlId,
        withdrawlId: withdrawal?.withdrawlId,
        amount: amount,
        commissionAmount: commissionAmount,
        netAmount: amount - commissionAmount,
        status: withdrawal?.status || "requested",
        paymentMethod: paymentMethodValue,
        updatedAt: withdrawal?.updatedAt,
        createdAt: withdrawal?.createdAt,
        formattedDate: withdrawal?.updatedAt
          ? new Date(withdrawal.updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "N/A",
        formattedTime: withdrawal?.updatedAt
          ? new Date(withdrawal.updatedAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
      };
    });

    // Calculate totals
    const totalAmount = formattedWithdrawals.reduce(
      (sum, w) => sum + w.amount,
      0
    );
    const totalCommission = formattedWithdrawals.reduce(
      (sum, w) => sum + w.commissionAmount,
      0
    );
    const totalNetAmount = formattedWithdrawals.reduce(
      (sum, w) => sum + w.netAmount,
      0
    );

    return res.status(200).json({
      success: true,
      count: withdrawals.length,
      summary: {
        totalAmount: totalAmount,
        totalCommission: totalCommission,
        totalNetAmount: totalNetAmount,
        averageAmount:
          withdrawals.length > 0 ? totalAmount / withdrawals.length : 0,
      },
      withdrawals: formattedWithdrawals,
    });
  } catch (error) {
    console.log("Requested withdrawal history fetching error:", error);

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

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const addPaymentMethod = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const role = decoded.role;

    // Get data from request body
    const { paymentType, paymentNumber, setAsDefault = false } = req.body;

    // Validate required fields
    if (!paymentType || !paymentNumber) {
      return res.status(400).json({
        success: false,
        message: "Payment type and payment number are required",
      });
    }

    // Validate payment type
    const validPaymentTypes = ["esewa", "khalti"];
    if (!validPaymentTypes.includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment type. Valid types: esewa, khalti",
      });
    }

    // Validate payment number format
    if (
      typeof paymentNumber !== "string" ||
      paymentNumber.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment number must be a non-empty string",
      });
    }

    const trimmedPaymentNumber = paymentNumber.trim();

    // Check if payment method already exists for this user
    const existingPaymentMethod = await PaymentMethod.findOne({
      where: {
        userId: userId,
        paymentNumber: trimmedPaymentNumber,
      },
    });

    if (existingPaymentMethod) {
      return res.status(400).json({
        success: false,
        message: "This payment method is already registered",
      });
    }

    // Start transaction for consistency
    const transaction = await db.sequelize.transaction();

    try {
      // If setting as default, unset other default payment methods
      if (setAsDefault) {
        await PaymentMethod.update(
          { isDefault: false },
          {
            where: { userId: userId },
            transaction,
          }
        );
      }

      // Create new payment method
      const paymentMethod = await PaymentMethod.create(
        {
          userId: userId,
          paymentType: paymentType,
          paymentNumber: trimmedPaymentNumber,
          isDefault: setAsDefault,
        },
        { transaction }
      );

      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "Payment method added successfully",
        data: {
          paymentMethodId: paymentMethod.paymentMethodId,
          paymentType: paymentMethod.paymentType,
          paymentNumber: paymentMethod.paymentNumber,
          isDefault: paymentMethod.isDefault,
          createdAt: paymentMethod.createdAt,
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.log("Error adding payment method:", error);

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

    // Handle unique constraint violation
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "This payment method is already registered for your account",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error occurred while adding payment method",
      error: error.message,
    });
  }
};

// Get all payment methods for user
export const getPaymentMethods = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const role = decoded.role;

    const paymentMethods = await PaymentMethod.findAll({
      where: { userId: userId },
      attributes: [
        "paymentMethodId",
        "paymentType",
        "paymentNumber",
        "isDefault",
        "createdAt",
        "updatedAt",
      ],
      order: [
        ["isDefault", "DESC"], // Default payment method first
        ["createdAt", "DESC"], // Then newest first
      ],
      raw: true,
    });

    return res.json({
      success: true,
      data: paymentMethods,
      count: paymentMethods.length,
      hasDefault: paymentMethods.some((method) => method.isDefault),
    });
  } catch (error) {
    console.log("Error getting payment methods:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error fetching payment methods",
      error: error.message,
    });
  }
};

// Edit/Update payment method
export const updatePaymentMethod = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    //const userId = 4
    //const role = decoded.role;

    const { paymentMethodId } = req.params;

    // Get update data from request body
    const { paymentType, paymentNumber, setAsDefault } = req.body;

    const parsedPaymentMethodId = parseInt(paymentMethodId);
    if (isNaN(parsedPaymentMethodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method ID",
      });
    }

    // Start transaction
    const transaction = await db.sequelize.transaction();

    try {
      // 1. Check if payment method exists and belongs to user
      const paymentMethod = await PaymentMethod.findOne({
        where: {
          paymentMethodId: parsedPaymentMethodId,
          userId: userId,
        },
        transaction,
      });

      if (!paymentMethod) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Payment method not found",
        });
      }

      // 2. Prepare update data
      const updateData = {};

      // Validate and add paymentType if provided
      if (paymentType !== undefined) {
        const validPaymentTypes = ["esewa", "khalti"];
        if (!validPaymentTypes.includes(paymentType)) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Invalid payment type. Valid types: esewa, khalti",
          });
        }
        updateData.paymentType = paymentType;
      }

      // Validate and add paymentNumber if provided
      if (paymentNumber !== undefined) {
        if (
          typeof paymentNumber !== "string" ||
          paymentNumber.trim().length === 0
        ) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Payment number must be a non-empty string",
          });
        }

        const trimmedPaymentNumber = paymentNumber.trim();

        // Check if new payment number already exists (excluding current one)
        const existingWithSameNumber = await PaymentMethod.findOne({
          where: {
            userId: userId,
            paymentNumber: trimmedPaymentNumber,
            paymentMethodId: { [db.Sequelize.Op.ne]: parsedPaymentMethodId }, // Not the current one
          },
          transaction,
        });

        if (existingWithSameNumber) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "This payment number is already registered",
          });
        }

        updateData.paymentNumber = trimmedPaymentNumber;
      }

      // 3. Handle default status if requested
      if (setAsDefault === true) {
        // Unset all other defaults first
        await PaymentMethod.update(
          { isDefault: false },
          {
            where: { userId: userId },
            transaction,
          }
        );
        updateData.isDefault = true;
      } else if (setAsDefault === false) {
        // Only allow unsetting if there's another default available
        if (paymentMethod.isDefault) {
          const otherPaymentMethods = await PaymentMethod.findAll({
            where: {
              userId: userId,
              paymentMethodId: { [db.Sequelize.Op.ne]: parsedPaymentMethodId },
            },
            transaction,
          });

          if (otherPaymentMethods.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message:
                "Cannot unset default. Add another payment method first.",
            });
          }

          // Set first other payment method as default
          await PaymentMethod.update(
            { isDefault: true },
            {
              where: {
                paymentMethodId: otherPaymentMethods[0].paymentMethodId,
              },
              transaction,
            }
          );
        }
        updateData.isDefault = false;
      }

      // 4. If no data to update, return early
      if (Object.keys(updateData).length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "No update data provided",
        });
      }

      // 5. Update the payment method
      await PaymentMethod.update(updateData, {
        where: {
          paymentMethodId: parsedPaymentMethodId,
          userId: userId,
        },
        transaction,
      });

      await transaction.commit();

      // 6. Get updated payment method
      const updatedPaymentMethod = await PaymentMethod.findOne({
        where: {
          paymentMethodId: parsedPaymentMethodId,
          userId: userId,
        },
        attributes: [
          "paymentMethodId",
          "paymentType",
          "paymentNumber",
          "isDefault",
          "createdAt",
          "updatedAt",
        ],
        raw: true,
      });

      return res.json({
        success: true,
        message: "Payment method updated successfully",
        data: updatedPaymentMethod,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.log("Error updating payment method:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "This payment number is already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error updating payment method",
      error: error.message,
    });
  }
};

// Get single payment method by ID
export const getPaymentMethodById = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const role = decoded.role;

    const { paymentMethodId } = req.params;

    const parsedPaymentMethodId = parseInt(paymentMethodId);
    if (isNaN(parsedPaymentMethodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method ID",
      });
    }

    const paymentMethod = await PaymentMethod.findOne({
      where: {
        paymentMethodId: parsedPaymentMethodId,
        userId: userId,
      },
      attributes: [
        "paymentMethodId",
        "paymentType",
        "paymentNumber",
        "isDefault",
        "createdAt",
        "updatedAt",
      ],
      raw: true,
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    return res.json({
      success: true,
      data: paymentMethod,
    });
  } catch (error) {
    console.log("Error getting payment method by ID:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error fetching payment method",
      error: error.message,
    });
  }
};

export const EarningPageOverview = async (req, res) => {
  res.status(200).json({
    message: "Earning Page Overview Data",
  });
};

export const EarningPagePaymentHistory = async (req, res) => {
  res.status(200).json({
    message: "Payment History",
  });
};

export const EarningPagePendingAmount = async (req, res) => {
  res.status(200).json({
    message: "Pending Amount Data",
  });
};

export const EarningPagePaymentMethods = async (req, res) => {
  res.status(200).json({
    message: "Payment Methods Data",
  });
};
