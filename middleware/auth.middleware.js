export const isAuth = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  return res.redirect("/login");
};

export const isGuest = (req, res, next) => {
  if (!req.session.userId) {
    return next();
  }
  return res.redirect("/");
};

export const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({
    status: 401,
    message: "You are not allowed to access",
  });
};
