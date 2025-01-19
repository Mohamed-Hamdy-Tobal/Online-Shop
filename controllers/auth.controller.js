import UserModel from "../models/user.model.js";
import { handleResponse } from "../util/handleResponse.js";
import { STATUS_CODES } from "../util/StatusCodes.js";
import bcrypt from "bcryptjs";
import Joi from "joi";

const signupSchema = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const getSignup = async (req, res, next) => {
  return handleResponse(res, {
    success: true,
    renderView: "signup",
  }, req);
};

export const getLogin = async (req, res, next) => {
  return handleResponse(res, {
    success: true,
    renderView: "login",
  }, req);
};

export const postSignup = async (req, res, next) => {
  try {
    const userData = req.body;
    console.log("userData:", userData);

    const { error } = signupSchema.validate(userData);
    if (error) {
      return handleResponse(res, {
        status: STATUS_CODES.FAIL,
        message: "Validation failed",
        error: error.details.map((detail) => detail.message),
      });
    }

    const isExistUser = await UserModel.findOne({ email: userData.email });
    if (isExistUser) {
      return handleResponse(res, {
        status: STATUS_CODES.FAIL,
        message: "A user with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = new UserModel({
      ...userData,
      password: hashedPassword,
    });

    await newUser.save();

    return handleResponse(res, {
      success: true,
      status: STATUS_CODES.CREATED,
      message: "Registration Successfully Created",
      data: {
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          isAdmin: newUser.isAdmin,
        },
      },
    });
  } catch (error) {
    console.error("Error in signup:", error);
    return handleResponse(res, {
      status: STATUS_CODES.ERROR,
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const postLogin = async (req, res, next) => {
  console.log("BODY : ", req.body);

  const { email, password } = req.body;
  if (!email || !password) {
    return handleResponse(res, {
      status: STATUS_CODES.FAIL,
      message: "Please provide both email and password",
    });
  }

  const user = await UserModel.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return handleResponse(res, {
      status: STATUS_CODES.AUTH,
      message: "Invalid credentials!",
    });
  }

  req.session.userId = user._id;
  req.session.isAdmin = user.isAdmin;

  return handleResponse(res, {
    success: true,
    status: STATUS_CODES.SUCCESS,
    message: "Login Successfully",
    data: {
      user,
    },
  }, req);
};

export const authLogout = async (req, res, next) => {
  try {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return handleResponse(res, {
          status: STATUS_CODES.ERROR,
          message: "Failed to log out. Please try again.",
        });
      }

      // Clear the cookie in the browser
      res.clearCookie("connect.sid", {
        path: "/",
      });

      console.log("GOOD");

      return handleResponse(res, {
        success: true,
        status: STATUS_CODES.SUCCESS,
        message: "Logged out successfully.",
      });
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return handleResponse(res, {
      status: STATUS_CODES.ERROR,
      message: "An error occurred during logout.",
    });
  }
};
