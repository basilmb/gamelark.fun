const sessionValidation = (req, res, next) => {
  if (!req.session.loged) {
    res.redirect("/signup");
  } else {
    next();
  }
};

const userValidation = (req, res, next) => {
  if (req.session.loged) {
    res.redirect("/");
  } else {
    next();
  }
};

module.exports = {
  sessionValidation,
  userValidation,
};
