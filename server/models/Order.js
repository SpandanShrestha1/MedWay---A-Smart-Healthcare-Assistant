export default (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      orderId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "order_id",
      },

      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "patient_id",
        references: {
          model: "users",
          key: "id",
        },
      },

      pharmacyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "pharmacy_id",
        references: {
          model: "pharmacies",
          key: "pharmacy_id",
        },
      },

      status: {
        type: DataTypes.ENUM(
          "pending",
          "accepted",
          "preparing",
          "out_for_delivery",
          "completed",
          "cancelled"
        ),
        defaultValue: "pending",
      },

      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "total_price",
      },

      paymentMethod: {
        type: DataTypes.ENUM("cod", "khalti", "esewa", "stripe"),
        allowNull: false,
      },

      paymentStatus: {
        type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
        defaultValue: "pending",
      },

      paymentReference: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "payment_reference",
      },

      orderDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "order_date",
      },
    },
    {
      tableName: "orders",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["patient_id"] },
        { fields: ["pharmacy_id"] },
        { fields: ["status"] },
      ],
    }
  );

  return Order;
};
