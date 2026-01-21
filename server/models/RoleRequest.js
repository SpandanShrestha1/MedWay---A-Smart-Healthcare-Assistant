export default (sequelize, DataTypes) => {
  const RoleRequest = sequelize.define(
    "RoleRequest",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
        references: {
          model: "users",
          key: "id",
        },
      },
      requestedRole: {
        type: DataTypes.ENUM("doctor", "pharmacist"),
        allowNull: false,
        field: "requested_role",
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "rejection_reason",
      },
      submittedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "submitted_at",
      },
      reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "reviewed_at",
      },
    },
    {
      tableName: "role_requests",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["user_id"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["requested_role"],
        },
        {
          fields: ["submitted_at"],
        },
      ],
    }
  );

  return RoleRequest;
};
