import ProductsModel from "../models/products.model.js";
import { handleResponse } from "../util/handleResponse.js";

import { STATUS_CODES } from "../util/StatusCodes.js";
import Joi from "joi";

const productSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Product name is required",
    "any.required": "Product name is missing",
  }),
  price: Joi.number().required().messages({
    "number.base": "Price must be a number",
    "any.required": "Price is required",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Description is required",
    "any.required": "Description is missing",
  }),
  category: Joi.string().required().messages({
    "string.empty": "Category is required",
    "any.required": "Category is missing",
  }),
});

export const getAddProduct = async (req, res, next) => {
  return handleResponse(
    res,
    {
      success: true,
      renderView: "addProduct",
    },
    req
  );
};

export const createProduct = async (req, res) => {
  const userId = req.session.userId;
  const product = req.body;

  console.log("userId IS :", userId);
  console.log("product IS :", product);
  console.log("req.file:", req.file);

  if (!userId) {
    return handleResponse(res, {
      status: STATUS_CODES.FAIL,
      message: "User not exist",
    });
  }

  // Validate product
  const { error } = productSchema.validate(product, { abortEarly: false });
  if (error) {
    return handleResponse(res, {
      status: STATUS_CODES.FAIL,
      message: "Validation Error",
      error: error.details.map((err) => err.message),
    });
  }

  try {
    const newProduct = new ProductsModel({
      ...product,
      image: `/uploads/${req.file.filename}`,
    });

    // Save product
    await newProduct.save();

    return handleResponse(res, {
      success: true,
      message: "Product Added successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return handleResponse(res, {
      status: STATUS_CODES.ERROR,
      message: "Error creating product",
      error: error.message,
    });
  }
};
