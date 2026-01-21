// relation -> user -> fk
// created_at -> timestamp
// updated_at -> timestamp
// status -> ENUM('requested', 'processing', 'completed', 'rejected', 'none') default 'none'
// withdrawl amount ->
// withdrawl id -> pk
export default (sequelize, DataTypes) => {
  const PharmacyWithdrawl = sequelize.define(
    "PharmacyWithdrawl",
    {
      withdrawlId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "withdrawl_id",
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

      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      commissionAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "requested",
          "processing",
          "completed",
          "rejected"
        ),
        defaultValue: "requested",
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "payment_method",
        defaultValue: "esewa",
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
      tableName: "pharmacy_withdrawls",
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ["user_id"] }, { fields: ["status"] }],
    }
  );

  return PharmacyWithdrawl;
};
