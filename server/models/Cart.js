export default (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    "Cart",
    {
      cartId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "cart_id",
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "carts",
      timestamps: true,
      underscored: true,
      indexes: [
        { unique: true, fields: ["user_id"] }, // one cart per user
      ],
    }
  );

  return Cart;
};
