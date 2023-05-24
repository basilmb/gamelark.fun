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
    unique: true
  },
  maxPurchars: {
    type: String,
    require: true,
    unique: true
  },
  maxUsers: {
    type: String,
    require: true,
    unique: true
  },
  expDate: {
    type: Date,
    require: true,
    unique: true
  },
  active: {
    type: Boolean,
    default: true
  },
  count: {
    type: Number,
    require: true,
    unique: true
  },
});

var model = mongoose.model("Coupon", couponSchema);

module.exports = model;