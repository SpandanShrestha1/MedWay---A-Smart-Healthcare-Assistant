// register

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../db/db.js";

const User = db.User;

// REGISTER CONTROLLER
export const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    // CHECK IF USER EXISTS
    const checkUser = await User.findOne({
      where: { email },
    });

    if (checkUser) {
      return res.json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 12);

    // CREATE USER
    await User.create({
      userName,
      email,
      password: hashedPassword,
    });

    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// LOGIN CONTROLLER
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // CHECK USER
    const checkUser = await User.findOne({
      where: { email },
    });

    if (!checkUser) {
      return res.json({
        success: false,
        message: "User doesn't exist! Please register first",
      });
    }

    // CHECK PASSWORD
    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );

    if (!checkPasswordMatch) {
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });
    }

    // CREATE JWT TOKEN
    const token = jwt.sign(
      {
        id: checkUser.id,
        role: checkUser.userType,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    // SEND LOGIN RESPONSE
    return res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: checkUser.id,
        email: checkUser.email,
        role: checkUser.role,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// LOGOUT CONTROLLER
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // set true in production
    sameSite: "strict",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully!",
  });
};

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};
