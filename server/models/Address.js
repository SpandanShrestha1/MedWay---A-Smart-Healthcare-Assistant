export default (sequelize, DataTypes) => {
  const Address = sequelize.define(
    "Address",
    {
      addressId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "address_id",
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "addresses",
      timestamps: true,
      underscored: true,
    }
  );

  Address.associate = (models) => {
    Address.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Address;
};
