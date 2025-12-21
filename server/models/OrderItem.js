export default (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      orderItemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "order_item_id",
      },

      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "order_id",
        references: {
          model: "orders",
          key: "order_id",
        },
        onDelete: "CASCADE",
      },

      medicineId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "medicine_id",
        references: {
          model: "medicines",
          key: "medicine_id",
        },
      },

      medicineName: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "order_items",
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ["order_id"] }, { fields: ["medicine_id"] }],
    }
  );

  return OrderItem;
};
