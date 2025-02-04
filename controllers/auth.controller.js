import UserModel from "../models/user.model.js";
import { handleResponse } from "../util/handleResponse.js";
import { STATUS_CODES } from "../util/StatusCodes.js";
import bcrypt from "bcryptjs";
import Joi from "joi";
import crypto from "crypto";
// import sendEmail from "../util/sendEmail.js";

const signupSchema = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const getSignup = async (req, res, next) => {
  return handleResponse(
    res,
    {
      success: true,
      renderView: "signup",
    },
    req
  );
};
export const getLogin = async (req, res, next) => {
  return handleResponse(
    res,
    {
      success: true,
      renderView: "login",
    },
    req
  );
};
export const getForgetPassword = async (req, res, next) => {
  return handleResponse(
    res,
    {
      success: true,
      renderView: "forget",
    },
    req
  );
};
export const getResetPassword = async (req, res, next) => {
  const { userId, refreshToken } = req.params;

  const user = await UserModel.findById(userId);

  if (!user) {
    return handleResponse(res, {
      status: STATUS_CODES.AUTH,
      message: "User with this email does not exist!",
    });
  }

  return handleResponse(
    res,
    {
      success: true,
      data: user.email,
      dataKey: "email",
      renderView: "reset",
    },
    req
  );
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

  return handleResponse(
    res,
    {
      success: true,
      status: STATUS_CODES.SUCCESS,
      message: "Login Successfully",
      data: {
        user,
      },
    },
    req
  );
};

export const postForget = async (req, res) => {
  console.log("BODY : ", req.body);

  const { email } = req.body;
  if (!email) {
    return handleResponse(res, {
      status: STATUS_CODES.FAIL,
      message: "Please provide an email",
    });
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    return handleResponse(res, {
      status: STATUS_CODES.AUTH,
      message: "User with this email does not exist!",
    });
  }

  console.log("USER Is :", user);

  // Generate a random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  console.log("resetToken is : ", resetToken);
  req.session.resetToken = resetToken; // Store in session
  req.session.userEmail = email; // Store user email in session
  req.session.resetExpires = Date.now() + 15 * 60 * 1000; // 15-minute expiration

  // Send email with reset link
  const resetLink = `http://localhost:4000/reset-password/${user._id}/${resetToken}`;
  // await sendEmail(
  //   email,
  //   "Password Reset Request",
  //   `Click here to reset your password: ${resetLink}`
  // );

  res.json({
    status: STATUS_CODES.SUCCESS,
    message: "Click on the link",
    refreshPasswordLink: resetLink,
  });
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { userId } = req.params;

  const user = await UserModel.findById(userId);

  if (!user) {
    return handleResponse(res, {
      status: STATUS_CODES.AUTH,
      message: "User with this email does not exist!",
    });
  }

  // Check if token exists in session
  if (!req.session.resetToken) {
    return handleResponse(res, {
      status: STATUS_CODES.FAIL,
      message: "Invalid or expired reset token!",
    });
  }

  // Check token expiration
  if (Date.now() > req.session.resetExpires) {
    return handleResponse(res, {
      status: STATUS_CODES.FAIL,
      message: "Reset token has expired! Please request a new one.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();

  // Clear session reset token
  req.session.resetToken = null;
  req.session.userEmail = null;
  req.session.resetExpires = null;

  return handleResponse(res, {
    status: STATUS_CODES.SUCCESS,
    message: "Password reset successful! You can now log in.",
  });
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
