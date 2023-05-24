const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    // unique: true
  },
  orderid: {
    type: String,
    require: true,
    // unique: true
  },
  date: {
    type: String
  },
  paymentmethod: {
    type: String
  },
  details: [
    {
      fullname: {
        type: String
      },
      email: {
        type: String
      },
      address: {
        type: String
      },
      city: {
        type: String
      },
      state: {
        type: String
      },
      zip: {
        type: Number
      },
    }
  ],
  products: [
    {
      productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      name: {
        type: String
      },
      quantity: {
        type: Number,
        default: 1
      },
      qnprice: {
        type: Number
      },
    }
  ],
  totalprice: {
    type: Number
  },
  totalamount: {
    type: Number
  },
  status: {
    type: Boolean,
    default: false
  },
  request: {
    type: Boolean,
    default: false
  },
  return: {
    type: Boolean,
    default: false
  },
  canceled: {
    type: Boolean,
    default: false
  },
})

var model = mongoose.model("Order", orderSchema);

module.exports = model;
