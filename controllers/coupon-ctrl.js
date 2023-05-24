const Coupon = require("../modals/coupon-modal");

/* Coupen Mange*/
const coupenMange = async function (req, res, next) {
  const allCoupons = await Coupon.find().lean();
  res.render("admin/coupon-manage", {
    adHome: true,
    userData: true,
    allCoupons,
  });
};

/* Get Add Coupon page */
const addCoupon = function (req, res, next) {
  res.render("admin/add-coupon", { adHome: true, action: true });
};

/* Create Coupon */
const createCoupon = async function (req, res, next) {
  try {
    const { name, code, disValue, maxPurchars, maxUsers, expDate } = req.body;

    // Check if coupon with same code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.render("admin/coupon-manage", {
        adHome: true,
        userData: true,
        allCoupons: await Coupon.find().lean(),
        duplicateCouponError: true,
      });
    }

    const couponData = await Coupon.create({
      name,
      code,
      disValue,
      maxPurchars,
      maxUsers,
      expDate,
    });

    res.redirect("/admin/coupons");
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
    console.log(error);
  }
};

/* Edit Coupon */
const editCoupon = async function (req, res, next) {
  try {
    const findOneCoupon = await Coupon.findOne({
      _id: req.params.id,
    }).lean();
    res.render("admin/edit-coupon", {
      adHome: true,
      action: true,
      findOneCoupon,
    });
  } catch (error) {
    res.render("user/404", {
      adHome: true,
    })
    console.log(error);
  }
};

/* Update Category */
const updateCoupon = async function (req, res, next) {
  try {
    await Coupon.updateOne(
      { _id: req.body.id },
      { $set: {
        name: req.body.name,
        code: req.body.code,
        disValue: req.body.disValue,
        minPurchars: req.body.minPurchars,
        maxUsers: req.body.maxUsers,
        expDate: req.body.expDate, } }
    );
    res.redirect("/admin/coupons");
  } catch (error) {
    res.render("user/404", {
      adHome: true,
    })
    console.log(error);
  }
};

/* Unlist Category */
const unlistCoupon = async function (req, res, next) {
  try {
    await Coupon.updateOne(
      { _id: req.params.id },
      { $set: { active: false } }
    );
    res.redirect("/admin/coupons");
  } catch (error) {
    res.render("user/404", {
      adHome: true,
    })
    console.log(error);
  }
};

/* List Category */
const listCoupon = async function (req, res, next) {
  try {
    await Coupon.updateOne(
      { _id: req.params.id },
      { $set: { active: true } }
    );
    res.redirect("/admin/coupons");
  } catch (error) {
    res.render("user/404", {
      adHome: true,
    })
    console.log(error);
  }
};

module.exports = {
  coupenMange,
  addCoupon,
  createCoupon,
  editCoupon,
  updateCoupon,
  unlistCoupon,
  listCoupon,
};
