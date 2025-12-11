export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "user_name",
        validate: {
          len: [3, 50],
          is: /^[a-zA-Z0-9_]+$/,
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          len: [5, 255],
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [6, 255],
        },
      },
      role: {
        type: DataTypes.ENUM("admin", "patient", "doctor", "pharmacist"),
        defaultValue: "patient",
        validate: {
          isIn: [["admin", "patient", "doctor", "pharmacist"]],
        },
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
      tableName: "users",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["user_name"],
        },
        {
          unique: true,
          fields: ["email"],
        },
        {
          fields: ["role"],
        },
      ],
    }
  );

  return User;
};
