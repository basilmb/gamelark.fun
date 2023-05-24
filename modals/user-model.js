const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true
  },
  number: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  active: {
    type: Boolean,
    default: true
  },
  products: [
    {
      productid: {
        type: String
      }
    }
  ],
  wishlist: [
    {
      productid: {
        type: String
      }
    }
  ],
  coupons: [
    {
      couponid: {
        type: String
      }
    }
  ],
  wallet: [
    {
      date: {
        type: String
      },
      amount: {
        type: String
      },
      status: {
        type: Boolean,
        default: true
      },
    }
  ],
  walletamount: {
    type: Number
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
      selected: {
        type: Boolean,
        default: false
      }
    }
  ],
  image:{
    type: Array,
    require: true
  }
});

var model = mongoose.model("User", userSchema);

module.exports = model;