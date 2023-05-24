const Order = require("../modals/order-modal");
const Product = require("../modals/product-model");
const User = require("../modals/user-model");

/* Order Mange*/
const orderMange = async function (req, res, next) {
    const orders = await Order.find()
      .populate("userid")
      .populate("products.productid").lean();

    res.render("admin/order-manage", { adHome: true, userData: true, orders });
};

/* order Delivered*/
const orderDelivered = async function (req, res, next) {
  try {
    // Update the status of the order to true
    await Order.updateOne({ _id: req.params.id }, { $set: { status: true } });

    // Get the products from the order
    const order = await Order.findOne({ _id: req.params.id }).populate('products.productid');
    const products = order.products;

    // Update the quantity of each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i].productid;
      const quantity = products[i].quantity;
      await Product.updateOne({ _id: product._id }, { $inc: { quantity: -quantity } });
    }

    // Redirect to the orders page
    res.redirect("/admin/orders");
  } catch (err) {
    console.log(err);
    res.render("user/404", {
      user: true,
    })
    console.log(err);
  }
};

const acceptReturn = async function (req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate('products.productid');
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await Order.updateOne({ _id: req.params.id }, { $set: { return: true } });

    // Add the following code to update the wallet array
    const totalAmount = order.totalamount;
    const date = Date.now();
      const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      const formattedDate = new Intl.DateTimeFormat("en-GB", options).format(
        date
      );
    await User.updateOne({ _id: order.userid }, { $push: {
      wallet: { 
        date: formattedDate, 
        amount: totalAmount, 
        status: true 
      } 
    }, $inc: { walletamount: totalAmount } });

    res.redirect("/admin/orders");
  } catch (err) {
    console.log(err);
    res.render("user/404", {
        user: true,
      })
      console.log(err);
  }
};

/* cancele Return*/
const canceleReturn = async function (req, res, next) {
  try {
    await Order.updateOne({ _id: req.params.id }, { $set: { return: false } });
    res.redirect("/admin/orders");
  } catch (err) {
    res.render("user/404", {
        user: true,
      })
      console.log(err);
  }
};

/* view Orders*/
const viewOrders = async function (req, res) {
  try {
    const orderData = await Order.findOne({ _id: req.params.id })
      .populate("userid")
      .populate("products.productid").lean();

    if (!orderData) {
      res.status(404).send({ error: "Order not found" });
      return;
    }

    res.render("admin/order-details", { confirmation: true, orderData });
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    res.status(500).send({ error: "Internal Server Error" });
    console.log(err);
  }
};

module.exports = {
    orderMange,
    orderDelivered,
    acceptReturn,
    canceleReturn,
    viewOrders,
  };