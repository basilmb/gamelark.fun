const User = require("../modals/user-model");
const Category = require("../modals/category-model");
const Product = require("../modals/product-model");
const Order = require("../modals/order-modal");

const moment = require("moment");

/* Login*/
const getLogin = function (req, res, next) {
  res.render("admin/login", { signup: true });
};

/* Home*/
let orderCount;
let totalPriceSum;
let totalAmountSum;
let couponDiscount;
let doughnutPieData;
let response;
let barChartDataString;
let totalWalletAmount;
let orders;

const getHome = async function (req, res, next) {
  try {
    const orderInfo = await Order.find().lean();
    orderCount = orderInfo.length;

    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalPriceSum: { $sum: "$totalprice" },
          totalAmountSum: { $sum: "$totalamount" },
        },
      },
    ]);

    response = await Order.aggregate([
      {
        $match: {
          paymentmethod: {
            $in: ["Cash On Delivery", "Online Payment", "User Wallet"],
          },
        },
      },
      {
        $group: {
          _id: "$paymentmethod",
          totalAmountSum: { $sum: "$totalamount" },
        },
      },
    ]);

    const paymentMethodData = {
      labels: response.map((item) => item._id),
      datasets: [
        {
          label: "Total Amount",
          data: response.map((item) => item.totalAmountSum),
          backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc"],
        },
      ],
    };

    doughnutPieData = JSON.stringify(paymentMethodData);

    orders = await Order.find({ status: true })
      .populate("userid")
      .populate("products.productid")
      .lean();

      const amount = await User.aggregate([
        {
          $group: {
            _id: null,
            totalWalletAmount: { $sum: "$walletamount" }
          }
        }
      ])

    totalPriceSum = result.length > 0 ? result[0].totalPriceSum : 0;
    totalAmountSum = result.length > 0 ? result[0].totalAmountSum : 0;
    totalWalletAmount = amount.length > 0 ? amount[0].totalWalletAmount : 0;
    couponDiscount = totalAmountSum - totalPriceSum;

    const processingCount = await Order.countDocuments({ status: false });
    const deliveredCount = await Order.countDocuments({ status: true });
    const returnedCount = await Order.countDocuments({ return: true });
    const canceledCount = await Order.countDocuments({ canceled: true });

    const barChartData = {
      labels: ["Processing", "Delivered", "Returned", "Canceled"],
      datasets: [
        {
          label: "Order Count",
          data: [processingCount, deliveredCount, returnedCount, canceledCount],
          backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc", "#e74a3b"],
        },
      ],
    };

    barChartDataString = JSON.stringify(barChartData);

    res.render("admin/home", {
      adHome: true,
      userData: true,
      orderCount,
      totalPriceSum,
      totalAmountSum,
      couponDiscount,
      orders,
      doughnutPieData: doughnutPieData,
      response,
      barChartData: barChartDataString,
      totalWalletAmount,
    });
  } catch (error) {
    console.log(error);
    res.render("user/404", {
      user: true,
    });
  }
};

/* filter By Date*/
const filterByDate = async function (req, res, next) {
  const { from, to } = req.body;
  const fromDate = moment(from).format("DD/MM/YYYY");
  const toDate = moment(to).format("DD/MM/YYYY");
  try {
    const orders = await Order.find({
      date: { $gte: fromDate, $lte: toDate },
      status: true
    })
    .populate("userid")
    .populate("products.productid")
    .lean();
    res.render("admin/home", {
      adHome: true,
      userData: true,
      orderCount,
      totalPriceSum,
      totalAmountSum,
      couponDiscount,
      orders,
      doughnutPieData: doughnutPieData,
      response,
      barChartData: barChartDataString,
      from,
      to,
      totalWalletAmount,
    });
  } catch (error) {
    console.log(error);
    res.render("user/404", {
      user: true,
    });
  }
};

/* Admin Login*/
const adminLogin = async function (req, res, next) {
  try {
    if (req.body.logname == "basil") {
      if (req.body.logpass == "505050") {
        req.session.loged = true;
        res.render("admin/home", {
          adHome: true,
          userData: true,
          orderCount,
          totalPriceSum,
          totalAmountSum,
          couponDiscount,
          orders,
          doughnutPieData: doughnutPieData,
          response,
          barChartData: barChartDataString,
          totalWalletAmount,
        });
      } else {
        res.render("admin/login", { signup: true, passErr: true });
      }
    } else {
      res.render("admin/login", { signup: true, nameErr: true });
    }
  } catch (err) {
    res.render("user/404", {
      user: true,
    });
    console.log(err);
  }
};

/* Admin Logout*/
const adminLogout = function (req, res, next) {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Get User Data*/
const getUserData = async function (req, res, next) {
  try {
    const userInfo = await User.find().lean();
    res.render("admin/user-data", { adHome: true, userData: true, userInfo });
  } catch (err) {
    res.render("user/404", {
      user: true,
    });
    console.log(error);
  }
};

/* Block User*/
const blockUser = async function (req, res, next) {
  try {
    await User.updateOne({ _id: req.params.id }, { $set: { active: false } });
    req.session.destroy();
    res.redirect("/admin/userdata");
  } catch (err) {
    res.render("user/404", {
      user: true,
    });
    console.log(err);
  }
};

/* UnBlock User*/
const unBlockUser = async function (req, res, next) {
  try {
    await User.updateOne({ _id: req.params.id }, { $set: { active: true } });
    res.redirect("/admin/userdata");
  } catch (err) {
    res.render("user/404", {
      user: true,
    });
    console.log(err);
  }
};

module.exports = {
  getLogin,
  getHome,
  adminLogin,
  getUserData,
  blockUser,
  unBlockUser,
  adminLogout,
  filterByDate,
};
