import { Sequelize, DataTypes } from "sequelize";
import UserModel from "../models/User.js";
import PharmacyModel from "../models/Pharmacy.js";
import MedicineModel from "../models/Medicine.js";
import CartModel from "../models/Cart.js";
import CartItemModel from "../models/CartItem.js";
import OrderModel from "../models/Order.js";
import OrderItemModel from "../models/OrderItem.js";

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
db.Pharmacy = PharmacyModel(sequelize, DataTypes);
db.Medicine = MedicineModel(sequelize, DataTypes);
db.Cart = CartModel(sequelize, DataTypes);
db.CartItem = CartItemModel(sequelize, DataTypes);
db.Order = OrderModel(sequelize, DataTypes);
db.OrderItem = OrderItemModel(sequelize, DataTypes);

// user and pharmacy
db.User.hasMany(db.Pharmacy, { foreignKey: "userId", onDelete: "CASCADE" });
db.Pharmacy.belongsTo(db.User, { foreignKey: "userId" });

// pharmacy and medicine
db.Pharmacy.hasMany(db.Medicine, {
  foreignKey: "pharmacyId",
  onDelete: "CASCADE",
});
db.Medicine.belongsTo(db.Pharmacy, { foreignKey: "pharmacyId" });

// user and cart
db.User.hasOne(db.Cart, { foreignKey: "userId", onDelete: "CASCADE" });
db.Cart.belongsTo(db.User, { foreignKey: "userId" });

// users and orders
db.User.hasMany(db.Order, { foreignKey: "patientId", onDelete: "CASCADE" });
db.Order.belongsTo(db.User, { foreignKey: "patientId" });

// pharmacy and order
db.Pharmacy.hasMany(db.Order, {
  foreignKey: "pharmacyId",
  onDelete: "CASCADE",
});
db.Order.belongsTo(db.Pharmacy, { foreignKey: "pharmacyId" });

// cart and cartitem
db.Cart.hasMany(db.CartItem, { foreignKey: "cartId", onDelete: "CASCADE" });
db.CartItem.belongsTo(db.Cart, { foreignKey: "cartId" });

// medicine and cartitem
db.Medicine.hasMany(db.CartItem, { foreignKey: "medicineId" });
db.CartItem.belongsTo(db.Medicine, { foreignKey: "medicineId" });

// order and orderitem
db.Order.hasMany(db.OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
db.OrderItem.belongsTo(db.Order, { foreignKey: "orderId" });

// medicine and orderitem
db.Medicine.hasMany(db.OrderItem, { foreignKey: "medicineId" });
db.OrderItem.belongsTo(db.Medicine, { foreignKey: "medicineId" });

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
