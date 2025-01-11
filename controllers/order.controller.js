import OrderModel from "../models/order.model.js";
import CartModel from "../models/cart.model.js";
import { handleResponse } from "../util/handleResponse.js";
import { STATUS_CODES } from "../util/StatusCodes.js";
import Joi from "joi";

const addressSchema = Joi.object({
  fullName: Joi.string().required().messages({
    "string.empty": "Full name is required",
    "any.required": "Full name is missing",
  }),
  phoneNumber: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be between 10-15 digits",
      "any.required": "Phone number is missing",
    }),
  street: Joi.string().required().messages({
    "string.empty": "Street address is required",
    "any.required": "Street address is missing",
  }),
  city: Joi.string().required().messages({
    "string.empty": "City is required",
    "any.required": "City is missing",
  }),
  country: Joi.string().required().messages({
    "string.empty": "Country is required",
    "any.required": "Country is missing",
  }),
});

// Create Order Function
export const createOrder = async (req, res) => {
  const userId = req.session.userId;
  const address = req.body;

  console.log("userId IS :", userId);
  console.log("req.body IS :", req.body);
  console.log("Address IS :", address);

  // Validate Address
  const { error } = addressSchema.validate(address, { abortEarly: false });
  if (error) {
    return handleResponse(res, {
      status: STATUS_CODES.FAIL,
      message: "Validation Error",
      error: error.details.map((err) => err.message),
    });
  }

  try {
    // Fetch Cart for the User
    const cart = await CartModel.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return handleResponse(res, {
        status: STATUS_CODES.NOTFOUND,
        message: "Cart is empty or not found",
      });
    }

    // Create Order
    const order = new OrderModel({
      userId,
      items: cart.items,
      totalPrice: cart.totalPrice,
      address,
      paymentMethod: "CASH",
      status: "Pending", // Default order status
    });

    // Save Order
    await order.save();

    // Clear User's Cart
    await CartModel.deleteOne({ userId });

    return handleResponse(res, {
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return handleResponse(res, {
      status: STATUS_CODES.ERROR,
      message: "Error creating order",
      error: error.message,
    });
  }
};

// Get User's Orders
export const getOrders = async (req, res) => {
  const userId = req.session.userId;

  try {
    const orders = await OrderModel.find({ userId }).select("-__v");
    if (!orders || orders.length === 0) {
      return handleResponse(res, {
        status: STATUS_CODES.NOTFOUND,
        message: "No orders found",
      });
    }

    return handleResponse(
      res,
      {
        success: true,
        message: "Successfully retrieved orders",
        data: orders,
        dataKey: "orders",
        renderView: "orders",
      },
      req
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return handleResponse(res, {
      status: STATUS_CODES.ERROR,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  console.log("orderId IS :", orderId);
  console.log("status IS :", status);

  try {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return handleResponse(res, {
        status: STATUS_CODES.NOTFOUND,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    return handleResponse(res, {
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    return handleResponse(res, {
      status: STATUS_CODES.ERROR,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Cancel Order 
export const cancelOrder = async (req, res) => {
  const { orderId } = req.body;
  const userId = req.session.userId;

  try {
    const order = await OrderModel.findOne({ _id: orderId, userId });
    if (!order) {
      return handleResponse(res, {
        status: STATUS_CODES.NOTFOUND,
        message: "Order not found",
      });
    }

    if (order.status !== "Pending") {
      return handleResponse(res, {
        status: STATUS_CODES.FAIL,
        message: "Only pending orders can be canceled",
      });
    }

    order.status = "Canceled";
    await order.save();

    return handleResponse(res, {
      success: true,
      message: "Order canceled successfully",
    });
  } catch (error) {
    console.error("Error canceling order:", error);
    return handleResponse(res, {
      status: STATUS_CODES.ERROR,
      message: "Error canceling order",
      error: error.message,
    });
  }
};
