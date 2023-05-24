const Product = require("../modals/product-model");
const User = require("../modals/user-model");
const Cart = require("../modals/cart-modal");
const Category = require("../modals/category-model");
const Order = require("../modals/order-modal");
const Coupon = require("../modals/coupon-modal");

const bcrypt = require("bcrypt");
const mailer = require("../controllers/nodemailer");
const otp = require("../controllers/otp-gen");
const session = require("express-session");

/* Signup*/
const getSignup = function (req, res, next) {
  res.render("user/signup", { signup: true });
};

/* Otp*/
const getOtp = function (req, res, next) {
  res.render("user/otp", { otp: true });
};

/* Home*/
const getHome = async function (req, res, next) {
  try {
    const gamesInfo = await Product.find({ categoryname: "Games" })
      .limit(8)
      .lean();

    for (const game of gamesInfo) {
      game.stock = game.stock > 0;
    }

    const consolesInfo = await Product.find({ categoryname: "Consoles" })
      .limit(8)
      .lean();

    for (const console of consolesInfo) {
      console.stock = console.stock > 0;
    }

    const accessoriesInfo = await Product.find({ categoryname: "Accessories" })
      .limit(8)
      .lean();

    for (const accessory of accessoriesInfo) {
      accessory.stock = accessory.stock > 0;
    }

    res.render("user/home", {
      user: true,
      gamesInfo,
      consolesInfo,
      accessoriesInfo,
    });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Games*/
const getGames = async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    let itemsCount = false;

    const gamesInfo = await Product.find({ categoryname: "Games" })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalGamesCount = await Product.countDocuments({
      categoryname: "Games",
    });
    const remainingGamesCount = totalGamesCount - skip - limit;

    if (remainingGamesCount > 0) {
      itemsCount = true;
    }

    res.render("user/games", {
      user: true,
      gamesInfo,
      itemsCount,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
};

/* Consoles*/
const getConsoles = async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    let itemsCount = false;

    const consolesInfo = await Product.find({ categoryname: "Consoles" })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalGamesCount = await Product.countDocuments({
      categoryname: "Consoles",
    });
    const remainingGamesCount = totalGamesCount - skip - limit;

    if (remainingGamesCount > 0) {
      itemsCount = true;
    }

    res.render("user/consoles", {
      user: true,
      consolesInfo,
      itemsCount,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
};

/* Accessories*/
const getAccessories = async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    let itemsCount = false;

    const accessoriesInfo = await Product.find({ categoryname: "Accessories" })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalGamesCount = await Product.countDocuments({
      categoryname: "Accessories",
    });
    const remainingGamesCount = totalGamesCount - skip - limit;

    if (remainingGamesCount > 0) {
      itemsCount = true;
    }

    res.render("user/accessories", {
      user: true,
      accessoriesInfo,
      itemsCount,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
};

/* single product View*/
const productView = async function (req, res, next) {
  try {
    const findOneProduct = await Product.findOne({ _id: req.params.id }).lean();
    res.render("user/single-product", { user: true, findOneProduct });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Send otp*/
let setOtp;
let userData;
let userMail;

const sendOtp = async function (req, res, next) {
  try {
    setOtp = otp.setOtp();
    userData = req.body;
    userMail = req.body.email;
    mailer.mail(userMail, setOtp);
    res.render("user/otp", { otp: true, email: userMail });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Resend otp*/
const reSendOtp = async function (req, res, next) {
  try {
    setOtp = otp.setOtp();
    mailer.mail(userMail, setOtp);
    res.render("user/otp", { otp: true, email: userMail });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Check otp*/
const checkOtp = async function (req, res, next) {
  try {
    const { first, second, third, fourth, fifth } = req.body;
    const localOtp = first + second + third + fourth + fifth;
    if (setOtp == localOtp) {
      const { name, email, number, password } = userData;
      const hashpassword = await bcrypt.hash(password, 10);

      const responce = await User.create({
        name,
        email,
        number,
        password: hashpassword,
      });
      res.render("user/login", { signup: true });
    } else {
      res.render("user/otp", { otp: true, err: true });
    }
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* UserLogin*/
let loginEmail;
const userLogin = async function (req, res, next) {
  try {
    loginEmail = req.body.email;
    const user = await User.findOne({ email: loginEmail });
    if (user != null && user.active == true) {
      const compare = await bcrypt.compare(req.body.logpass, user.password);
      if (compare == true && req.body.logpass != "") {
        req.session.loged = true;
        req.session.data = user;
        res.redirect("/");
      } else {
        res.render("user/login", { signup: true, passErr: true });
      }
    } else {
      res.render("user/login", { signup: true, nameErr: true });
    }
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Profile*/
const getProflie = async function (req, res, next) {
  try {
    const userId = req.session.data._id;
    const userData = await User.findOne({ email: loginEmail }).lean();
    const orders = await Order.find({ userid: userId })
      .populate("userid")
      .populate("products.productid")
      .lean();
    console.log(orders);
    res.render("user/profile", { user: true, userData, orders });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* wallet History*/
const walletHistory = async function (req, res, next) {
  try {
    const walletData = await User.findOne({ email: loginEmail }).lean();
    res.render("user/wallet-history", {
      user: true,
      wallet: walletData.wallet,
    });
  } catch (error) {
    console.log(error);
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* otp for reset password*/
const forgotPass = async function (req, res, next) {
  try {
    res.render("user/reset-pass", { signup: true });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* email for reset password*/
let userOtp;
let passEmail;
const setPass = async function (req, res, next) {
  try {
    passEmail = req.body.email;
    userOtp = otp.setOtp();
    mailer.mail(passEmail, userOtp);
    res.render("user/forgot-pass", { otp: true, email: passEmail });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Resend otp*/
const reOtp = async function (req, res, next) {
  try {
    setOtp = otp.setOtp();
    mailer.mail(passEmail, setOtp);
    res.render("user/otp", { otp: true, email: userMail });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Check otp*/
const checkUser = async function (req, res, next) {
  try {
    const { first, second, third, fourth, fifth } = req.body;
    const localOtp = first + second + third + fourth + fifth;
    console.log(userOtp);
    if (userOtp == localOtp) {
      res.render("user/new-pass", { signup: true });
    } else {
      res.render("user/forgot-pass", { otp: true, err: true });
    }
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Update Password*/
const updatePass = async function (req, res, next) {
  try {
    const hashpassword = await bcrypt.hash(req.body.logpass, 10);
    await User.updateOne(
      { email: passEmail },
      { $set: { password: hashpassword } }
    );
    res.render("user/login", { signup: true });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* User Logout*/
const userLogout = function (req, res, next) {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Go To Checkout*/
const goToCheckout = async function (req, res, next) {
  try {
    const userId = req.session.data._id;
    const userMail = req.session.data.email;
    const userDoc = await Cart.findOne({ userid: userId }).populate(
      "products.productid"
    );
    const { products } = userDoc;
    cartlist = products
      .filter(({ productid }) => productid.stock > 0)
      .map(({ productid, qnprice, quantity }) => ({
        _id: productid._id,
        name: productid.productname,
        qnprice,
        quantity,
      }));
    const totalprice = cartlist.reduce((acc, crr) => (acc += crr.qnprice), 0);
    const totalamount = cartlist.reduce((acc, crr) => (acc += crr.qnprice), 0);
    const productsCount = cartlist.length;
    const findOneUser = await User.findOne({ _id: userId }).lean();
    const OneUserData = findOneUser.details;
    res.render("user/checkout", {
      cart: true,
      cartlist,
      totalprice,
      totalamount,
      productsCount,
      OneUserData,
      userMail,
    });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Apply Coupon*/
const applyCoupon = async function (req, res, next) {
  try {
    const userId = req.session.data._id;
    const userMail = req.session.data.email;
    const userDoc = await Cart.findOne({ userid: userId }).populate(
      "products.productid"
    );
    const { products } = userDoc;
    const cartlist = products.map(({ productid, qnprice, quantity }) => ({
      _id: productid._id,
      name: productid.productname,
      qnprice,
      quantity,
    }));

    const totalprice = cartlist.reduce((acc, crr) => (acc += crr.qnprice), 0);
    let totalamount = cartlist.reduce((acc, crr) => (acc += crr.qnprice), 0);
    const productsCount = products.length;
    const findOneUser = await User.findOne({ _id: userId }).lean();
    const OneUserData = findOneUser.details;

    couponCode = req.body.code;
    const findCoupon = await Coupon.findOne({ code: couponCode }).lean();

    let discountAmount;
    let notfound = false;
    let used = false;
    let success = false;
    let limited = false;
    let expired = false;

    if (!findCoupon) {
      notfound = true;
    } else {
      const couponId = findCoupon._id;
      const usedCoupon = await User.findOne({
        coupons: { $elemMatch: { couponid: couponId } },
      }).lean();
      if (usedCoupon) {
        used = true;
      } else {
        // Check if the coupon has expired
        const currentDate = new Date();
        if (findCoupon.expDate < currentDate) {
          expired = true;
        } else {
          // Check if count exceeds maxUsers
          if (findCoupon.count > findCoupon.maxUsers) {
            limited = true;
          } else {
            success = true;
            await User.findOneAndUpdate(
              { _id: userId },
              {
                $addToSet: {
                  coupons: {
                    couponid: couponId,
                  },
                },
              }
            );
            const maxPurchars = findCoupon.maxPurchars;
            if (totalprice > maxPurchars) {
              const discountValue = findCoupon.disValue / 100;
              totalamount = totalprice - discountValue * maxPurchars;
              discountAmount = discountValue * maxPurchars;
            } else {
              const discountValue = findCoupon.disValue / 100;
              totalamount = totalprice - discountValue * totalprice;
              discountAmount = discountValue * totalprice;
            }
            await Cart.updateOne(
              { userid: userId },
              { $set: { totalamount: totalamount } }
            );
            await Coupon.updateOne({ _id: couponId }, { $inc: { count: 1 } });
          }
        }
      }
    }

    res.render("user/checkout", {
      cart: true,
      cartlist,
      totalprice,
      totalamount,
      productsCount,
      OneUserData,
      userMail,
      discountAmount,
      notfound,
      used,
      success,
      limited,
      expired,
    });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Remove Coupon*/
const removeCoupon = async function (req, res, next) {
  try {
    const userId = req.session.data._id;
    const userMail = req.session.data.email;
    const userDoc = await Cart.findOne({ userid: userId }).populate(
      "products.productid"
    );
    const { products } = userDoc;
    const cartlist = products.map(({ productid, qnprice, quantity }) => ({
      _id: productid._id,
      name: productid.productname,
      qnprice,
      quantity,
    }));

    const totalprice = cartlist.reduce((acc, curr) => acc + curr.qnprice, 0);
    const totalamount = cartlist.reduce((acc, curr) => acc + curr.qnprice, 0);
    const productsCount = products.length;
    const findOneUser = await User.findOne({ _id: userId }).lean();
    const OneUserData = findOneUser.details;

    const findCoupon = await Coupon.findOne({ code: couponCode }).lean();

    const couponId = findCoupon._id;
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          coupons: {
            couponid: couponId,
          },
        },
      }
    );

    await Cart.updateOne(
      { userid: userId },
      { $set: { totalamount: totalamount } }
    );

    res.render("user/checkout", {
      cart: true,
      cartlist,
      totalprice,
      totalamount,
      productsCount,
      OneUserData,
      userMail,
    });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Selected Address*/
const selectedAddress = async function (req, res) {
  try {
    const detailId = req.params.id;
    const userId = req.session.data._id;
    await User.updateOne(
      { _id: userId, "details._id": detailId },
      {
        $set: {
          "details.$.selected": true,
        },
      }
    );
    const userInfo = await User.find({ _id: userId }).select("details").lean();
    userInfo.forEach(async (elem) => {
      elem.details.forEach(async (innerelem) => {
        if (detailId != innerelem._id) {
          await User.updateOne(
            { "details._id": innerelem._id },
            {
              $set: {
                "details.$.selected": false,
              },
            },
            { new: true }
          );
        }
      });
    });
    res.redirect("/gocheckout");
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    res.status(500).send({ error: "Internal Server Error" });
    console.error(error);
  }
};

/* Edit User Data*/
const editUserData = async function (req, res) {
  try {
    const detailId = req.params.id;
    const userId = req.session.data._id;
    const {
      details: [findEditData],
    } = await User.findOne(
      { _id: userId },
      { details: { $elemMatch: { _id: detailId } } }
    ).lean();
    res.render("user/editdata", { user: true, findEditData });
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
    console.error(error);
  }
};

/* Update User Data*/
const updateUserDetails = async function (req, res, next) {
  try {
    const detailId = req.body.id;
    const userId = req.session.data._id;
    const response = await User.updateOne(
      { _id: userId, "details._id": detailId },
      {
        $set: {
          "details.$.fullname": req.body.fullname,
          "details.$.email": req.body.email,
          "details.$.address": req.body.address,
          "details.$.city": req.body.city,
          "details.$.state": req.body.state,
          "details.$.zip": req.body.zip,
        },
      }
    );
    res.redirect("/gocheckout");
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.error(error);
  }
};

/* Delete User Data*/
const deleteUserData = async function (req, res) {
  try {
    const userId = req.session.data._id;
    await User.findByIdAndUpdate(userId, {
      $pull: { details: { _id: req.params.id } },
    });
    res.redirect("/gocheckout");
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
    console.error(error);
  }
};

module.exports = {
  getSignup,
  getOtp,
  getHome,
  getGames,
  getConsoles,
  getAccessories,
  getProflie,
  sendOtp,
  checkOtp,
  userLogin,
  userLogout,
  reSendOtp,
  reOtp,
  forgotPass,
  setPass,
  checkUser,
  updatePass,
  productView,
  goToCheckout,
  selectedAddress,
  deleteUserData,
  editUserData,
  updateUserDetails,
  applyCoupon,
  removeCoupon,
  walletHistory,
};
