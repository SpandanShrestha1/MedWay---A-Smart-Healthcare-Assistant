export default (sequelize, DataTypes) => {
  const CartItem = sequelize.define(
    "CartItem",
    {
      cartItemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "cart_item_id",
      },

      cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "cart_id",
        references: {
          model: "carts",
          key: "cart_id",
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
        onDelete: "CASCADE",
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },

      priceAtTime: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "price_at_time",
      },
    },
    {
      tableName: "cart_items",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["cart_id"] },
        { fields: ["medicine_id"] },
        { unique: true, fields: ["cart_id", "medicine_id"] },
      ],
    }
  );

  return CartItem;
};
