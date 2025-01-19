import { handleResponse } from "../util/handleResponse.js";

export const checkoutCart = async (req, res, next) => {
  return handleResponse(res, {
    success: true,
    renderView: "checkout",
  }, req);
};
