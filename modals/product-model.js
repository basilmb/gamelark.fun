const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productid: {
    type: String,
    require: true,
    // unique: true
  },
  productname: {
    type: String,
    require: true,
    // unique: true
  },
  category:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Category',
    require: true,
  },
  categoryname: {
    type: String,
    require: true,
  },
  price: {
    type: String,
    require: true,
  },
  disprice: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  stock: {
    type: Number,
    require: true,
  },
  image:{
    type: Array,
    require: true
  },
  active: {
    type: Boolean,
    default: true
  }
});

var model = mongoose.model("Product", productSchema);

module.exports = model;