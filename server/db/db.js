import { Sequelize, DataTypes } from "sequelize";
import UserModel from "../models/User.js";

const sequelize = new Sequelize("healthcare_db", "root", "$admin12345", {
  host: "localhost",
  dialect: "mysql",
  port: 3306,
  logging: console.log,
});

try {
  await sequelize.authenticate();
  console.log("MySQL database connected successfully");
} catch (err) {
  console.log("MySQL database connection error:", err.message);
}

const db = {
  Sequelize,
  sequelize,
  DataTypes,
};

db.User = UserModel(sequelize, DataTypes);

try {
  await sequelize.sync({
    force: false,
    alter: false,
  });
  console.log("✅ All tables created successfully");
} catch (error) {
  console.log("Table creation error:", error);
}

export { sequelize, db };
