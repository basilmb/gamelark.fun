const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    // unique: true
  },
  products: [
    {
      productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: {
        type: Number,
        default: 1
      },
      qnprice: {
        type: Number
      },
      qndisprice: {
        type: Number
      }
    }
  ],
  wishlist: [
    {
      productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      qnprice: {
        type: Number
      },
      qndisprice: {
        type: Number
      }
    }
  ],
  totalprice: {
    type: Number
  },
  totalamount: {
    type: Number
  }
})

var model = mongoose.model("Cart", cartSchema);

module.exports = model;
