const Product = require("../modals/product-model");
const User = require("../modals/user-model");
const Cart = require("../modals/cart-modal");
const Category = require("../modals/category-model");
const session = require("express-session");

/* Add to cart*/
const addCart = async function (req, res) {
  try {
    const userId = req.session.data._id;
    console.log(userId);
    if (!userId) {
      console.log("Login to your account");
      return res.status(400).json({ error: "Login to your account" });
    }

    const productId = req.params.id;
    const findOneProduct = await Product.findOne({ _id: productId }).lean();
    const productPrice = findOneProduct.price;
    const originalprice = findOneProduct.disprice;
    const userCart = await Cart.findOne({ userid: userId }).lean();
    console.log(userCart);
    const stock = findOneProduct.stock;

    if (stock > 0) {
      if (userCart) {
        const existingProduct = await Cart.findOne({
          products: {
            $elemMatch: { productid: productId },
          },
        });

        if (!existingProduct) {
          await Cart.findOneAndUpdate(
            { userid: userId },
            {
              $addToSet: {
                products: {
                  productid: productId,
                  qnprice: productPrice,
                  qndisprice: originalprice,
                },
              },
            },
            { upsert: true, new: true }
          );
        } else {
          console.log("Product already exists in cart");
          return res
            .status(400)
            .json({ error: "Product already exists in cart" });
        }
      } else {
        await Cart.create({
          userid: userId,
          products: [
            {
              productid: productId,
              qnprice: productPrice,
              qndisprice: originalprice,
            },
          ],
        });
      }

      await User.findOneAndUpdate(
        { _id: userId },
        {
          $addToSet: {
            products: {
              productid: productId,
            },
          },
        },
        { upsert: true, new: true }
      );

      await Cart.updateOne(
        { userid: userId },
        { $pull: { wishlist: { productid: productId } } }
      );

      await User.updateOne(
        { _id: userId },
        { $pull: { wishlist: { productid: productId } } }
      );

      console.log("Product added to cart");
      return res.json({ status: true });
    } else {
      console.log("Out of stock");
      return res.status(400).json({ error: "Out of stock" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/* Add to Wish List*/
const addWish = async function (req, res) {
  try {
    const userId = req.session.data._id;
    if (!userId) {
      return res.status(400).json({ error: "Login to your account" });
    }
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId }).lean();
    const productPrice = product.price;
    const originalprice = product.disprice;

    const userWish = await Cart.findOne({ userid: userId }).lean();
    if (userWish) {
      const existingProduct = await Cart.findOne({
        wishlist: {
          $elemMatch: { productid: productId },
        },
      });
      if (!existingProduct) {
        const response = await Cart.findOneAndUpdate(
          { userid: userId },
          {
            $addToSet: {
              wishlist: {
                productid: productId,
                qnprice: productPrice,
                qndisprice: originalprice,
              },
            },
          },
          { upsert: true, new: true }
        );
      } else {
        return res
          .status(400)
          .json({ error: "Product already exists in wish list" });
      }
    } else {
      const responce = await Cart.create({
        userid: userId,
        wishlist: [
          {
            productid: productId,
            qnprice: productPrice,
            qndisprice: originalprice,
          },
        ],
      });
    }
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: {
          wishlist: {
            productid: productId,
          },
        },
      },
      { upsert: true, new: true }
    );

    await Cart.updateOne(
      { userid: userId },
      { $pull: { products: { productid: productId } } }
    );

    await User.updateOne(
      { _id: userId },
      { $pull: { products: { productid: productId } } }
    );
    res.json({ status: true });
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
    console.log(error);
  }
};

/* go to cart*/
const goToCart = async function (req, res, next) {
  try {
    const userId = req.session.data._id;
    const userDoc = await Cart.find({ userid: userId }).populate(
      "products.productid"
    );
    if (Array.isArray(userDoc) && userDoc.length > 0) {
      const [{ products }] = userDoc;
      const cartlist = products.map(
        ({ productid, quantity, qnprice, qndisprice }) => ({
          _id: productid._id,
          name: productid.productname,
          price: productid.price,
          quantity,
          qnprice,
          qndisprice,
          image: productid.image[0],
          disprice: productid.disprice,
          category: productid.categoryname,
        })
      );
      const totalprice = cartlist.reduce((acc, crr) => (acc += crr.qnprice), 0);
      const productsCount = products.length;
      let isCart;
      if(productsCount > 0){
        isCart = true;
      }
      await Cart.updateOne(
        { userid: userId },
        { $set: { totalprice: totalprice, totalamount: totalprice } }
      );
      res.render("user/cart", {
        cart: true,
        cartlist,
        totalprice,
        productsCount,
        isCart,
      });
    } else {
      res.render("user/cart", { cart: true, cartlist: [] });
    }
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* go to wishlist*/
const goToWish = async function (req, res, next) {
  try {
    const userId = req.session.data._id;
    const userDoc = await Cart.find({ userid: userId }).populate(
      "wishlist.productid"
    );

    if (Array.isArray(userDoc) && userDoc.length > 0) {
      const [{ wishlist }] = userDoc;
      const wishlistdata = wishlist.map(
        ({ productid, qnprice, qndisprice }) => ({
          _id: productid._id,
          name: productid.productname,
          price: productid.price,
          qnprice,
          qndisprice,
          image: productid.image[0],
          disprice: productid.disprice,
          category: productid.categoryname,
        })
      );
      const productsCount = wishlist.length;
      res.render("user/wish-list", { cart: true, wishlistdata, productsCount });
    } else {
      res.render("user/wish-list", { cart: true, wishlistdata: [] });
    }
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* Minus Quantity*/
const minusQuantity = async function (req, res, next) {
  try {
    const userId = req.session.data._id;
    const productId = req.body.id;
    const findOneProduct = await Product.findOne({ _id: productId }).lean();
    const productPrice = findOneProduct.price;
    const originalprice = findOneProduct.disprice;
    const look = await Cart.findOne({ userid: userId });
    const check = look.products.find((value) => {
      return value.productid == productId;
    });
    if (check.quantity == 1) {
      const find = await Cart.findOne({ userid: userId });
      const data = find.products.find((value) => {
        return value.productid == productId;
      });
      res.json({ status: true, cart: response, data });
    } else {
      const response = await Cart.findOneAndUpdate(
        {
          userid: userId,
          "products.productid": productId,
        },
        {
          $inc: {
            "products.$.quantity": -1,
            "products.$.qnprice": -productPrice,
            "products.$.qndisprice": -originalprice,
          },
        },
        { new: true } // to return the updated cart object
      );
      const find = await Cart.findOne({ userid: userId });
      const data = find.products.find((value) => {
        return value.productid == productId;
      });
      // Calculate the updated total price
      const updatedTotalPrice = response.products.reduce((acc, product) => {
        return acc + product.qnprice;
      }, 0);
      await Cart.updateOne(
        { userid: userId },
        { $set: { totalprice: updatedTotalPrice, totalamount: updatedTotalPrice } }
      );
      res.json({ status: true, cart: response, data, updatedTotalPrice });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
  }
};

/* Plus Quantity*/
const plusQuantity = async function (req, res, next) {
  try {
    const userId = req.session.data._id;
    const productId = req.body.id;
    const findOneProduct = await Product.findOne({ _id: productId }).lean();
    const productPrice = findOneProduct.price;
    const originalprice = findOneProduct.disprice;
    const stock = findOneProduct.stock;
    const userCart = await Cart.findOne({ userid: userId, "products.productid": productId,}).lean();
    const product = userCart.products.find(
      (product) => product.productid.toString() === productId.toString()
    );
    const quantity = product.quantity;
    if ( quantity < stock) {
    const response = await Cart.findOneAndUpdate(
      {
        userid: userId,
        "products.productid": productId,
      },
      {
        $inc: {
          "products.$.quantity": 1,
          "products.$.qnprice": productPrice,
          "products.$.qndisprice": originalprice,
        },
      },
      { new: true } // to return the updated cart object
    );
    const find = await Cart.findOne({ userid: userId });
    const data = find.products.find((value) => {
      return value.productid == productId;
    });
    // Calculate the updated total price
    const updatedTotalPrice = response.products.reduce((acc, product) => {
      return acc + product.qnprice;
    }, 0);
    await Cart.updateOne(
      { userid: userId },
      { $set: { totalprice: updatedTotalPrice, totalamount: updatedTotalPrice } }
    );
    res.json({ status: true, cart: response, data, updatedTotalPrice });
  } else {
    res.json({ status: false, message: "Out of stock" });
  }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
  }
};

/* Delete Item*/
const deleteItem = async function (req, res, next) {
  try {
    const userId = req.session.data._id;
    const productId = req.params.id;

    await Cart.updateOne(
      { userid: userId },
      { $pull: { products: { productid: productId } } }
    );

    await User.updateOne(
      { _id: userId },
      { $pull: { products: { productid: productId } } }
    );

    res.redirect("/gocart");
  } catch (err) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* Delete wish*/
const deleteWishItem = async function (req, res, next) {
  try {
    const userId = req.session.data._id;
    const productId = req.params.id;

    await Cart.updateOne(
      { userid: userId },
      { $pull: { wishlist: { productid: productId } } }
    );

    await User.updateOne(
      { _id: userId },
      { $pull: { wishlist: { productid: productId } } }
    );

    res.redirect("/gowish");
  } catch (err) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

module.exports = {
  addCart,
  addWish,
  goToCart,
  goToWish,
  minusQuantity,
  plusQuantity,
  deleteItem,
  deleteWishItem,
};
