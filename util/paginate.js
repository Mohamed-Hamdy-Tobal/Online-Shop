export const paginate = async (model, query = {}, options = {}) => {
  try {
    const { page = 1, limit = 10, sort = null, select = null } = options;

    const parsedPage = Math.max(1, parseInt(page, 1));
    const parsedLimit = Math.max(1, parseInt(limit, 10));
    const skip = (parsedPage - 1) * parsedLimit;

    const totalDocuments = await model.countDocuments(query);

    const documents = await model
      .find(query)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit);

    const totalPages = Math.ceil(totalDocuments / parsedLimit);

    return {
      success: true,
      data: documents,
      pagination: {
        totalDocuments,
        totalPages,
        currentPage: parsedPage,
        limit: parsedLimit,
        hasNextPage: parsedPage < totalPages,
        hasPreviousPage: parsedPage > 1,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Error during pagination",
      error: error,
    };
  }
};
