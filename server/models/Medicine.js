export default (sequelize, DataTypes) => {
  const Medicine = sequelize.define(
    "Medicine",
    {
      medicineId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "medicine_id",
      },

      pharmacyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "pharmacy_id",
        references: {
          model: "pharmacies",
          key: "pharmacy_id",
        },
        onDelete: "CASCADE",
      },

      pharmacistId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "pharmacist_id",
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      medicineName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: "medicine_name",
        validate: {
          len: [2, 150],
        },
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      brand: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      stockQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "stock_quantity",
        validate: {
          min: 0,
        },
      },

      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },

      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "expiry_date",
      },

      isPrescriptionRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_prescription_required",
      },

      status: {
        type: DataTypes.ENUM("active", "out_of_stock"),
        defaultValue: "active",
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
      tableName: "medicines",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["pharmacy_id"],
        },
        {
          fields: ["medicine_name"],
        },
        {
          fields: ["category"],
        },
      ],
    }
  );

  return Medicine;
};
