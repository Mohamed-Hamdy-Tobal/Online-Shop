import ProductsModel from "../models/products.model.js";
import { handleResponse } from "../util/handleResponse.js";

export const getProduct = async (req, res) => {
  const product = await ProductsModel.findById(req.params.id);
  console.log("SINGLE PRODUCT IS : ", product);
  return handleResponse(res, {
    success: true,
    data: product || null,
    dataKey: "product",
    renderView: "product",
  });
};