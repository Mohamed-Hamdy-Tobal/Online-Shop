import { handleResponse } from "../util/handleResponse.js";

export const getAddProduct = async (req, res, next) => {
  return handleResponse(res, {
    success: true,
    renderView: "addProduct",
  }, req);
};
