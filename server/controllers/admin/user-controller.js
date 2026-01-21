// controllers/userController.js
import { Op, Sequelize } from "sequelize";
import { db } from "../../db/db.js";

// Get all users with filtering, pagination
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 2,
      role,
      status,
      requestedRole,
      requestStatus,
      startDate,
      endDate,
      search,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build the where clause for main user query
    const whereClause = {};

    // Filter by role
    if (role && role !== "all") {
      whereClause.role = role;
    }

    // Filter by status
    if (status && status !== "all") {
      whereClause.status = status;
    }

    // Filter by search term (username or email)
    if (search) {
      whereClause[Op.or] = [
        { userName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt[Op.lte] = end;
      }
    }

    // Build include for role requests
    const includeOptions = [
      {
        model: db.RoleRequest,
        as: "roleRequests",
        required: false,
        where: {},
        include: [
          {
            model: db.RequestDocument,
            as: "documents",
            required: false,
          },
        ],
      },
    ];

    // Filter users who have requested specific roles
    if (requestedRole) {
      includeOptions[0].required = true;
      includeOptions[0].where.requestedRole = requestedRole;
    }

    // Filter by role request status
    if (requestStatus) {
      includeOptions[0].required = true;
      includeOptions[0].where.status = requestStatus;
    }

    // Special handling for "request to become doctor/pharmacist" filter
    if (requestedRole === "doctor" || requestedRole === "pharmacist") {
      // This will only return users who have pending requests for specific roles
      includeOptions[0].required = true;
      includeOptions[0].where.requestedRole = requestedRole;
      includeOptions[0].where.status = "pending";
    }

    // Sort configuration
    const order = [];
    if (sortBy === "createdAt") {
      order.push(["createdAt", sortOrder]);
    } else if (sortBy === "userName") {
      order.push(["userName", sortOrder]);
    } else if (sortBy === "email") {
      order.push(["email", sortOrder]);
    } else if (sortBy === "role") {
      order.push(["role", sortOrder]);
    } else {
      order.push(["createdAt", "DESC"]);
    }

    // Execute the query
    const { count, rows: users } = await db.User.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      distinct: true,
      order,
      limit: limitNum,
      offset: offset,
      attributes: {
        exclude: ["password"],
        include: [
          // Add role request status as a virtual field
          [
            Sequelize.literal(`(
              SELECT status 
              FROM role_requests 
              WHERE role_requests.user_id = User.id 
                AND status = 'pending'
              LIMIT 1
            )`),
            "hasPendingRequest",
          ],
        ],
      },
    });

    // Format the response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roleRequests:
        user.roleRequests?.map((request) => ({
          id: request.id,
          requestedRole: request.requestedRole,
          status: request.status,
          rejectionReason: request.rejectionReason,
          submittedAt: request.submittedAt,
          reviewedAt: request.reviewedAt,
          documents:
            request.documents?.map((doc) => ({
              id: doc.id,
              documentType: doc.documentType,
              documentUrl: doc.documentUrl,
              description: doc.description,
            })) || [],
        })) || [],
      hasPendingRequest: user.dataValues.hasPendingRequest === "pending",
    }));

    return res.status(200).json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  const user = await db.User.findByPk(req.params.id, {
    attributes: { exclude: ["password"] },
    include: [
      {
        model: db.RoleRequest,
        as: "roleRequests",
        include: [
          {
            model: db.RequestDocument,
            as: "documents",
          },
        ],
      },
    ],
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.json({ success: true, data: user });
};

export const updateUser = async (req, res) => {
  const allowedFields = ["userName", "email", "role", "status"];

  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  await db.User.update(updates, {
    where: { id: req.params.id },
  });

  res.json({ success: true, message: "User updated" });
};

export const updateRoleRequest = async (req, res) => {
  const { status, rejectionReason } = req.body;

  const request = await db.RoleRequest.findByPk(req.params.id);
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  await request.update({
    status,
    rejectionReason: status === "rejected" ? rejectionReason : null,
    reviewedAt: new Date(),
  });

  //  If approved, update user role
  if (status === "approved") {
    await db.User.update(
      { role: request.requestedRole },
      { where: { id: request.userId } }
    );
  }

  res.json({ success: true, message: "Request updated" });
};
