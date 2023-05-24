const adminValidation = (req, res, next) => {
  if (!req.session.loged) {
    res.redirect("/admin");
  } else {
    next();
  }
};

const adminlogin = (req, res, next) => {
  if (req.session.loged) {
    res.redirect("/admin/home");
  } else {
    next();
  }
};

module.exports = {
    adminValidation,
    adminlogin
};
