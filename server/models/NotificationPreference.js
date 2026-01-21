export default (sequelize, DataTypes) => {
  const NotificationConfig = sequelize.define(
    "NotificationConfig",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      emailNotifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      pushNotifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      emergencyAlerts: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "notification_configs",
      timestamps: true,
    }
  );

  return NotificationConfig;
};
