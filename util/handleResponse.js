export const handleResponse = (
  res,
  {
    success = false,
    dataKey = "data",
    data,
    message,
    status,
    error,
    renderView = null,
  }
) => {
  if (success) {
    if (renderView) {
      return res.render(renderView, {
        [dataKey]: data || [],
      });
    }
    return res.status(status || 200).json({
      status: status || 200,
      message: message || "Success Request",
      data,
    });
  }

  return res.status(status || 500).json({
    status: status || 500,
    message: message || "Internal server error",
    error,
  });
};
