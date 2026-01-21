export default (sequelize, DataTypes) => {
  const PlatformConfig = sequelize.define(
    "PlatformConfig",
    {
      configId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "config_id",
      },
      platformName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "platform_name",
      },
      supportPhone: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "support_phone",
      },
      supportEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "support_email",
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "platform_configs",
      timestamps: true,
      underscored: true,
    }
  );
  return PlatformConfig;
};
