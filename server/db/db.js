import { Sequelize, DataTypes } from "sequelize";
import UserModel from "../models/User.js";
import PharmacyModel from "../models/Pharmacy.js";
import MedicineModel from "../models/Medicine.js";
import CartModel from "../models/Cart.js";
import CartItemModel from "../models/CartItem.js";
import OrderModel from "../models/Order.js";
import OrderItemModel from "../models/OrderItem.js";
import AddressModel from "../models/Address.js";
import PharmacyWithdrawlModel from "../models/PharmacyWithdrawl.js";
import PaymentMethodModel from "../models/PaymentMethod.js";
import RoleRequestModel from "../models/RoleRequest.js";
import RequestDocumentModel from "../models/RequestDocument.js";
import PlatformConfigModel from "../models/PlatformConfig.js";
import NotificationPreferenceModel from "../models/NotificationPreference.js";

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
db.Address = AddressModel(sequelize, DataTypes);
db.PharmacyWithdrawl = PharmacyWithdrawlModel(sequelize, DataTypes);
db.PaymentMethod = PaymentMethodModel(sequelize, DataTypes);
db.RoleRequest = RoleRequestModel(sequelize, DataTypes);
db.RequestDocument = RequestDocumentModel(sequelize, DataTypes);
db.RoleRequest = RoleRequestModel(sequelize, DataTypes);
db.RequestDocument = RequestDocumentModel(sequelize, DataTypes);
db.PlatformConfig = PlatformConfigModel(sequelize, DataTypes);
db.NotificationConfig = NotificationPreferenceModel(sequelize, DataTypes);

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

// user and address
db.User.hasMany(db.Address, { foreignKey: "userId", onDelete: "CASCADE" });
db.Address.belongsTo(db.User, { foreignKey: "userId" });

// address and order
db.Address.hasMany(db.Order, { foreignKey: "addressId", onDelete: "SET NULL" });
db.Order.belongsTo(db.Address, { foreignKey: "addressId" });

// user and pharmacy withdrawl
db.User.hasMany(db.PharmacyWithdrawl, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
db.PharmacyWithdrawl.belongsTo(db.User, { foreignKey: "userId" });

// user and paymentMethod
db.User.hasMany(db.PaymentMethod, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
db.PaymentMethod.belongsTo(db.User, { foreignKey: "userId" });

// user and rolerequest
db.User.hasMany(db.RoleRequest, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  as: "roleRequests",
});
db.RoleRequest.belongsTo(db.User, { foreignKey: "userId", as: "user" });

// rolerequest and requestdocument
db.RoleRequest.hasMany(db.RequestDocument, {
  foreignKey: "roleRequestId",
  onDelete: "CASCADE",
  as: "documents",
});
db.RequestDocument.belongsTo(db.RoleRequest, {
  foreignKey: "roleRequestId",
  as: "roleRequest",
});

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
