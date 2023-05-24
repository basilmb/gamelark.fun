const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryid: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
    unique: true
  },
  active: {
    type: Boolean,
    default: true
  }
});

var model = mongoose.model("Category", categorySchema);

module.exports = model;