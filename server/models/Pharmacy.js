export default (sequelize, DataTypes) => {
  const Pharmacy = sequelize.define(
    "Pharmacy",
    {
      pharmacyId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "pharmacy_id",
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

      pharmacyName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: "pharmacy_name",
        validate: {
          len: [3, 150],
        },
      },

      address: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      licenseNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: "license_number",
      },

      contactNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: "contact_number",
        validate: {
          is: /^[0-9+\-() ]+$/,
        },
      },

      deliveryAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "delivery_available",
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
      tableName: "pharmacies",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["license_number"],
        },
        {
          fields: ["user_id"],
        },
      ],
    }
  );

  return Pharmacy;
};
