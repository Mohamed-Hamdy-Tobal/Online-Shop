import ProductsModel from "../models/products.model.js";
import { handleResponse } from "../util/handleResponse.js";
import { STATUS_CODES } from "../util/StatusCodes.js";
import { paginate } from "../util/paginate.js";

export const getAllProducts = async (req, res) => {
  try {
    const { page, limit, sort, category } = req.query;

    console.log("Session id : " + req.session.userId);

    const categoriesEnums = ["tv", "fan", "washing"];
    const query =
      category && category !== "all" && categoriesEnums.includes(category)
        ? { category }
        : {};

    const options = {
      page,
      limit,
      sort,
      select: "-__v",
    };

    const result = await paginate(ProductsModel, query, options);

    if (result.success) {
      console.log("products:", result);
      return handleResponse(
        res,
        {
          success: result.success,
          data: result.data,
          dataKey: "products",
          renderView: "index",
        },
        req
      );
    }

    return handleResponse(res, {
      status: STATUS_CODES.FAIL,
      message: result.message || "An error occurred while fetching products",
      error: result.error,
    });
  } catch (error) {
    return handleResponse(res, {
      status: STATUS_CODES.ERROR,
      message: "Internal server error",
      error: error.message,
    });
  }
};
