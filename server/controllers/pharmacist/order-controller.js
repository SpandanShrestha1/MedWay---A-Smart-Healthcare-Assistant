import { db, sequelize } from "../../db/db.js";

const Order = db.Order;
const OrderItem = db.OrderItem;
const Medicine = db.Medicine;
const Pharmacy = db.Pharmacy;
const User = db.User;
const { Op } = sequelize;

export const getAllOrdersOfPharmacist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Pharmacist id is required!",
      });
    }

    const orderFilter = {};
    if (status) {
      orderFilter.status = status;
    }

    const orders = await Order.findAll({
      where: orderFilter,
      include: [
        {
          model: Pharmacy,
          where: { userId },
          attributes: ["pharmacyId", "pharmacyName"],
        },
        {
          model: OrderItem,
          include: [{ model: Medicine }],
        },
        {
          model: User,
          attributes: ["id", "userName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

export const getOrderDetailsForPharmacist = async (req, res) => {
  try {
    const { id } = req.params; // orderId

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order id is required!",
      });
    }

    const order = await Order.findOne({
      where: { orderId: id },
      include: [
        {
          model: Pharmacy,
          attributes: [
            "pharmacyId",
            "pharmacyName",
            "address",
            "contactNumber",
          ],
        },
        {
          model: User,
          attributes: ["id", "userName", "email"], // patient info
        },
        {
          model: OrderItem,
          attributes: ["orderItemId", "medicineName", "price", "quantity"],
          include: [
            {
              model: Medicine,
              attributes: ["medicineId", "category", "brand"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Order status is required!",
      });
    }

    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // 🔒 Prevent double stock increase
    if (order.status === "cancelled") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled!",
      });
    }

    // 🔁 If cancelling, restock medicines
    if (status === "cancelled") {
      for (const item of order.OrderItems) {
        await Medicine.increment(
          { stockQuantity: item.quantity },
          {
            where: { medicineId: item.medicineId },
            transaction,
          }
        );
      }
    }

    // Update order status
    order.status = status;
    await order.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message:
        status === "cancelled"
          ? "Order cancelled and stock restored successfully!"
          : "Order status updated successfully!",
      order,
    });
  } catch (e) {
    await transaction.rollback();
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};
