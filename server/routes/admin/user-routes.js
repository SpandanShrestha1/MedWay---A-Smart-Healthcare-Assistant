import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateRoleRequest,
} from "../../controllers/admin/user-controller.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.patch("/role-requests/:id", updateRoleRequest);

export default router;
