export default (sequelize, DataTypes) => {
  const PaymentMethod = sequelize.define(
    "PaymentMethod",
    {
      paymentMethodId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "payment_method_id",
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
      paymentType: {
        type: DataTypes.ENUM("esewa", "khalti"),
        allowNull: false,
        field: "payment_type",
        validate: {
          isIn: [["esewa", "khalti"]],
        },
      },
      paymentNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "payment_number",
        validate: {
          len: [1, 50],
        },
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_default",
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "payment_methods",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "payment_number"],
          name: "unique_user_payment_number",
        },
        {
          fields: ["user_id"],
        },
        {
          fields: ["payment_type"],
        },
        {
          fields: ["is_default"],
        },
      ],
    }
  );

  PaymentMethod.associate = (models) => {
    PaymentMethod.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return PaymentMethod;
};
