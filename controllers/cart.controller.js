import CartModel from "../models/cart.model.js";
import { handleResponse } from "../util/handleResponse.js";
import { STATUS_CODES } from "../util/StatusCodes.js";
import Joi from "joi";

const addToCartSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Product name is required",
    "any.required": "Product name is missing",
  }),
  productId: Joi.string().required().messages({
    "string.empty": "Product ID is required",
    "any.required": "Product ID is missing",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be greater than zero",
    "any.required": "Price is required",
  }),
});

export const getCart = async (req, res) => {
  const userId = req.session.userId;
  console.log("userId IS : ", userId);

  try {
    const cart = await CartModel.findOne({ userId }).select("-__v -userId");
    console.log("CART IS : ", cart);
    if (!cart)
      return handleResponse(
        res,
        {
          success: true,
          message: "Cart not found",
          data: null,
          dataKey: "cart",
          renderView: "cart",
        },
        req
      );

    return handleResponse(
      res,
      {
        success: true,
        message: "Successfully Get You'r Cart",
        data: cart || null,
        dataKey: "cart",
        renderView: "cart",
      },
      req
    );
  } catch (error) {
    return handleResponse(res, {
      status: STATUS_CODES.ERROR,
      message: "Error fetching cart",
      error: error.message,
    });
  }
};

export const addToCart = async (req, res) => {
  const { productId, quantity, price, name } = req.body;
  const userId = req.session.userId;
  console.log("userId IS : ", userId);
  console.log("req.body IS : ", req.body);

  const { error } = addToCartSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return handleResponse(res, {
      status: STATUS_CODES.FAIL,
      message: "Validation Error",
      error: error.details.map((err) => err.message),
    });
  }

  try {
    let cart = await CartModel.findOne({ userId });

    const quantityNum = Number(quantity);

    console.log("cart: ", cart);

    if (!cart) {
      // إذا لم يكن لدى المستخدم عربة، قم بإنشائها
      cart = new CartModel({
        userId,
        items: [{ productId, quantity, price, name }],
        totalPrice: quantityNum * price,
      });
    } else {
      // تحقق إذا كان المنتج موجودًا بالفعل
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      console.log("USER HAS CART AND ITEM IS : ", existingItem);

      if (existingItem) {
        existingItem.quantity += quantityNum;
      } else {
        // if user has cart and the item no exist before
        cart.items.push({ productId, quantity, price, name });
      }
      // add the calc of product added (quantity and price) to the total price of the cart
      cart.totalPrice += quantityNum * price;
    }

    await cart.save();
    return handleResponse(res, {
      success: true,
      message: "Product added to cart",
      data: {
        cart,
      },
    });
  } catch (error) {
    console.log("error is : ", error);
    return handleResponse(res, {
      status: STATUS_CODES.ERROR,
      message: "Error adding to cart",
      error: error.message,
    });
  }
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.session.userId;

  console.log("userId IS : ", userId);
  try {
    const cart = await CartModel.findOne({ userId });
    console.log("CART TO REMOVE FROM IS : ", cart);
    if (!cart)
      return handleResponse(res, {
        status: STATUS_CODES.NOTFOUND,
        message: "Cart not found",
      });

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    console.log("itemIndex IS : ", itemIndex);

    if (itemIndex > -1) {
      const item = cart.items[itemIndex];
      console.log("Product Item IS : ", item);

      cart.totalPrice -= Number(item.quantity) * Number(item.price);

      cart.items.splice(itemIndex, 1);
    }
    await cart.save();

    return res.json({ message: "Product removed from cart" });
  } catch (error) {
    console.log("ERROR IS :", error);
    return handleResponse(res, {
      status: STATUS_CODES.ERROR,
      message: "Error fetching cart",
      error: error.message,
    });
  }
};

export const editCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.session.userId;

  console.log("userId IS : ", userId);
  console.log("req.body IS : ", req.body);

  if (isNaN(quantity) || quantity <= 0) {
    return res
      .status(400)
      .json({ message: "Quantity must be a positive number." });
  }

  try {
    const cart = await CartModel.findOne({ userId });
    console.log("CART TO Edit IS : ", cart);
    if (!cart)
      return handleResponse(res, {
        status: STATUS_CODES.NOTFOUND,
        message: "Cart not found",
      });

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    console.log("itemIndex IS : ", itemIndex);

    if (itemIndex > -1) {
      const item = cart.items[itemIndex];
      console.log("Product Item IS : ", item);

      const priceDifference =
        parseInt(quantity) * parseInt(item.price) -
        parseFloat(item.quantity) * parseFloat(item.price);
      cart.totalPrice += priceDifference;

      cart.items[itemIndex].quantity = Number(quantity);

      console.log("Updated Product Item IS : ", cart.items[itemIndex]);
    }
    await cart.save();

    return res.json({ message: "Cart updated successfully" });
  } catch (error) {
    return handleResponse(res, {
      status: STATUS_CODES.ERROR,
      message: "Error Edit In Cart",
      error: error.message,
    });
  }
};
