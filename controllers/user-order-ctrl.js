const Product = require("../modals/product-model");
const User = require("../modals/user-model");
const Cart = require("../modals/cart-modal");
const Order = require("../modals/order-modal");

const Razorpay = require("razorpay");
const crypto = require("crypto");

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* Confirmation*/
const confirmation = async function (req, res) {
  try {
    // Extract the radio button value from the request body
    const paymentMethod = req.body.radio;
    req.session.paymentMethod = paymentMethod;

    if (paymentMethod == "Cash On Delivery") {
      const date = Date.now();
      const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      const formattedDate = new Intl.DateTimeFormat("en-GB", options).format(
        date
      );

      const userId = req.session.data._id;
      const userDoc = await Cart.findOne({ userid: userId }).populate(
        "products.productid"
      );

      const cartlist = userDoc.products
        .filter(({ productid }) => productid.stock > 0)
        .map(({ productid, qnprice, quantity }) => ({
          _id: productid._id,
          name: productid.productname,
          quantity,
          qnprice,
        }));

      const totalprice = userDoc.totalprice;
      const totalamount = userDoc.totalamount;

      const findOneUser = await User.findOne({ _id: userId }).lean();
      const selectedDetail = findOneUser.details.find(
        (detail) => detail.selected
      );

      // Decrease product stock and create updated cartlist
      const updatedCartlist = [];
      for (const { _id, name, quantity, qnprice } of cartlist) {
        const product = await Product.findById(_id);
        if (product) {
          const updatedStock =
            product.stock >= quantity ? product.stock - quantity : 0;
          product.stock = updatedStock;
          await product.save();

          updatedCartlist.push({
            _id,
            name,
            quantity,
            qnprice,
          });
        }
      }

      // Create a new Order document
      const order = new Order({
        userid: req.session.data._id,
        date: formattedDate,
        paymentmethod: paymentMethod,
        products: updatedCartlist.map(({ _id, name, quantity, qnprice }) => ({
          productid: _id,
          name: name,
          quantity: quantity,
          qnprice: qnprice,
        })),
        details: [
          {
            fullname: selectedDetail.fullname,
            email: selectedDetail.email,
            address: selectedDetail.address,
            city: selectedDetail.city,
            state: selectedDetail.state,
            zip: selectedDetail.zip,
          },
        ],
        totalprice: totalprice,
        totalamount: totalamount,
      });

      // Save the Order document to the database
      await order.save();

      req.session.order = order._id;

      const objectId = order._id;
      const uniqueId = objectId.toString();
      const orderId = uniqueId.substring(18, 24);
      await Order.updateOne({ _id: objectId }, { $set: { orderid: orderId } });

      await Cart.updateOne({ userid: userId }, { $unset: { products: "" } });
      await User.updateOne({ _id: userId }, { $unset: { products: "" } });

      res.json({ url: "/goconfirmation" });
    } else if (paymentMethod == "Online Payment") {
      const userId = req.session.data._id;
      const userDoc = await Cart.findOne({ userid: userId }).populate(
        "products.productid"
      );

      const totalamount = userDoc.totalamount;
      const grandtotal = totalamount;

      var options = {
        amount: grandtotal * 100,
        currency: "INR",
        receipt: "",
      };

      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
          res.status(500).send({ error: "Internal Server Error" });
          return;
        } else {
          res.json({ status: true, order: order });
          console.log(order);
        }
      });
    } else {
      const date = Date.now();
      const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      const formattedDate = new Intl.DateTimeFormat("en-GB", options).format(
        date
      );

      const userId = req.session.data._id;
      const userDoc = await Cart.findOne({ userid: userId }).populate(
        "products.productid"
      );

      const cartlist = userDoc.products
        .filter(({ productid }) => productid.stock > 0)
        .map(({ productid, qnprice, quantity }) => ({
          _id: productid._id,
          name: productid.productname,
          quantity,
          qnprice,
        }));

      const totalprice = userDoc.totalprice;
      const totalamount = userDoc.totalamount;

      const userData = await User.findOne({ _id: userId });
      const walletAmount = userData.walletamount;

      if (totalamount > walletAmount) {
        return res.status(400).json({ error: "Insufficient wallet balance" });
      } else {
        const findOneUser = await User.findOne({ _id: userId }).lean();
        const selectedDetail = findOneUser.details.find(
          (detail) => detail.selected
        );

        // Decrease product stock and create updated cartlist
        const updatedCartlist = [];
        for (const { _id, name, quantity, qnprice } of cartlist) {
          const product = await Product.findById(_id);
          if (product) {
            const updatedStock =
              product.stock >= quantity ? product.stock - quantity : 0;
            product.stock = updatedStock;
            await product.save();

            updatedCartlist.push({
              _id,
              name,
              quantity,
              qnprice,
            });
          }
        }

        // Create a new Order document
        const order = new Order({
          userid: req.session.data._id,
          date: formattedDate,
          paymentmethod: paymentMethod,
          products: updatedCartlist.map(({ _id, name, quantity, qnprice }) => ({
            productid: _id,
            name: name,
            quantity: quantity,
            qnprice: qnprice,
          })),
          details: [
            {
              fullname: selectedDetail.fullname,
              email: selectedDetail.email,
              address: selectedDetail.address,
              city: selectedDetail.city,
              state: selectedDetail.state,
              zip: selectedDetail.zip,
            },
          ],
          totalprice: totalprice,
          totalamount: totalamount,
        });

        // Save the Order document to the database
        await order.save();

        req.session.order = order._id;

        const objectId = order._id;
        const uniqueId = objectId.toString();
        const orderId = uniqueId.substring(18, 24);
        await Order.updateOne(
          { _id: objectId },
          { $set: { orderid: orderId } }
        );

        await Cart.updateOne({ userid: userId }, { $unset: { products: "" } });
        await User.updateOne({ _id: userId }, { $unset: { products: "" } });

        // Find the user document and reduce the totalamount from walletamount
        const updatedUser = await User.findOneAndUpdate(
          { _id: userId },
          { $inc: { walletamount: -totalamount } },
          { new: true }
        );

        // Create a new element in the wallet array
        const walletElement = {
          date: formattedDate,
          amount: totalamount,
          status: false,
        };

        updatedUser.wallet.push(walletElement);

        // Save the updated user document
        await updatedUser.save();

        res.json({ url: "/goconfirmation" });
      }
    }
  } catch (error) {
    console.log(error);
    res.render("user/404", {
      user: true,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const userVerifypayment = async function (req, res) {
  try {
    const user = req.session.data._id;
    if (user) {
      let raz = req.body;
      console.log(req.body);

      let hmac = crypto.createHmac("sha256", "1eqVSoGvFXNCAzRX4WsLgD5e");
      hmac.update(
        raz.payment.razorpay_order_id + "|" + raz.payment.razorpay_payment_id
      );
      let generatedSignature = hmac.digest("hex");

      if (generatedSignature === raz.payment.razorpay_signature) {
        const date = Date.now();
        const options = {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        };
        const formattedDate = new Intl.DateTimeFormat("en-GB", options).format(
          date
        );

        const userId = req.session.data._id;
        const userDoc = await Cart.findOne({ userid: userId }).populate(
          "products.productid"
        );

        const cartlist = userDoc.products
          .filter(({ productid }) => productid.stock > 0)
          .map(({ productid, qnprice, quantity }) => ({
            _id: productid._id,
            name: productid.productname,
            quantity,
            qnprice,
          }));

        const findOneUser = await User.findOne({ _id: userId }).lean();
        const selectedDetail = findOneUser.details.find(
          (detail) => detail.selected
        );

        const totalamount = userDoc.totalamount;
        const paymentMethod = req.session.paymentMethod;

        // Decrease product stock and create updated cartlist
        const updatedCartlist = [];
        for (const { _id, name, quantity, qnprice } of cartlist) {
          const product = await Product.findById(_id);
          if (product) {
            const updatedStock =
              product.stock >= quantity ? product.stock - quantity : 0;
            product.stock = updatedStock;
            await product.save();

            updatedCartlist.push({
              _id,
              name,
              quantity,
              qnprice,
            });
          }
        }

        // Create a new Order document
        const order = new Order({
          userid: req.session.data._id,
          date: formattedDate,
          paymentmethod: paymentMethod,
          products: updatedCartlist.map(({ _id, name, quantity, qnprice }) => ({
            productid: _id,
            name: name,
            quantity: quantity,
            qnprice: qnprice,
          })),
          details: [
            {
              fullname: selectedDetail.fullname,
              email: selectedDetail.email,
              address: selectedDetail.address,
              city: selectedDetail.city,
              state: selectedDetail.state,
              zip: selectedDetail.zip,
            },
          ],
          totalamount: totalamount,
        });

        // Save the Order document to the database
        await order.save();

        req.session.order = order._id;

        const objectId = order._id;
        const uniqueId = objectId.toString();
        const orderId = uniqueId.substring(18, 24);
        await Order.updateOne(
          { _id: objectId },
          { $set: { orderid: orderId } }
        );

        await Cart.updateOne({ userid: userId }, { $unset: { products: "" } });
        await User.updateOne({ _id: userId }, { $unset: { products: "" } });

        res.json({ PaymentSuccess: true });
      } else {
        res.json({ PaymentSuccess: false });
      }
    } else {
      res.json({ PaymentSuccess: false });
    }
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    res.json({ PaymentSuccess: false });
    console.error(error);
  }
};

/* Go To Confirmation*/
const goToConfirmation = async function (req, res) {
  try {
    const orderData = await Order.findOne({ _id: req.session.order })
      .populate("userid")
      .populate("products.productid")
      .lean();

    if (!orderData) {
      res.status(404).send({ error: "Order not found" });
      return;
    }

    res.render("user/confirmation", { confirmation: true, orderData });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    res.status(500).send({ error: "Internal Server Error" });
  }
};

/* Cancel Order*/
const cancelOrder = async function (req, res, next) {
  try {
    await Order.updateOne({ _id: req.params.id }, { $set: { canceled: true } });
    res.redirect("/profile");
  } catch (err) {
    res.render("user/404", {
      user: true,
    });
    next(err);
    console.error(err);
  }
};

/* Return Product*/
const returnProduct = async function (req, res, next) {
  try {
    await Order.updateOne({ _id: req.params.id }, { $set: { request: true } });
    res.redirect("/profile");
  } catch (err) {
    res.render("user/404", {
      user: true,
    });
    next(err);
    console.error(err);
  }
};

/* view Orders*/
const viewOrders = async function (req, res) {
  try {
    const orderData = await Order.findOne({ _id: req.params.id })
      .populate("userid")
      .populate("products.productid")
      .lean();

    if (!orderData) {
      res.status(404).send({ error: "Order not found" });
      return;
    }

    res.render("user/order-details", { confirmation: true, orderData });
  } catch (error) {
    res.render("user/404", {
      user: true,
    });
    res.status(500).send({ error: "Internal Server Error" });
    console.error(error);
  }
};

module.exports = {
  confirmation,
  userVerifypayment,
  goToConfirmation,
  cancelOrder,
  returnProduct,
  viewOrders,
};
