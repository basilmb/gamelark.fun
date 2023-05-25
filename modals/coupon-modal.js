const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    unique: true
  },
  code: {
    type: String,
    require: true,
    unique: true
  },
  disValue: {
    type: String,
    require: true,
  },
  maxPurchars: {
    type: String,
    require: true,
  },
  maxUsers: {
    type: String,
    require: true,
  },
  expDate: {
    type: Date,
    require: true,
  },
  active: {
    type: Boolean,
    default: true
  },
  count: {
    type: Number,
    require: true,
  },
});

var model = mongoose.model("Coupon", couponSchema);

module.exports = model;