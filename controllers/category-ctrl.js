const User = require("../modals/user-model");
const Category = require("../modals/category-model");
const Product = require("../modals/product-model");

/* Category Manage */
const categoryManage = async function (req, res, next) {
  try {
    const allCategories = await Category.find().lean();
    res.render("admin/category-manage", {
      adHome: true,
      userData: true,
      allCategories,
    });
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* Get Add Category page */
const addCategory = function (req, res, next) {
  res.render("admin/add-category", { adHome: true, action: true });
};

/* Create Category */
const createCategory = async function (req, res, next) {
  try {
    const { name } = req.body;

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
    if (existingCategory) {
      return res.render("admin/category-manage", {
        adHome: true,
        userData: true,
        allCategories: await Category.find().lean(),
        duplicateCategoryError: true
      });
    }

    const categoryData = await Category.create({ name });

    const objectId = categoryData._id;
    const uniqueId = objectId.toString();
    const categoryId = uniqueId.substring(19, 24);
    await Category.updateOne(
      { _id: objectId },
      { $set: { categoryid: categoryId } }
    );
    res.redirect("/admin/categories");
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};


/* Edit Category */
const editCategory = async function (req, res, next) {
  try {
    const findOneCategory = await Category.findOne({
      _id: req.params.id,
    }).lean();
    res.render("admin/edit-category", {
      adHome: true,
      action: true,
      findOneCategory,
    });
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* Update Category */
const updateCategory = async function (req, res, next) {
  try {
    await Category.updateOne(
      { _id: req.body.id },
      { $set: { name: req.body.name } }
    );
    console.log(req.body.name);
    res.redirect("/admin/categories");
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* Unlist Category */
const unlistCategory = async function (req, res, next) {
  try {
    await Category.updateOne(
      { _id: req.params.id },
      { $set: { active: false } }
    );
    res.redirect("/admin/categories");
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* List Category */
const listCategory = async function (req, res, next) {
  try {
    await Category.updateOne(
      { _id: req.params.id },
      { $set: { active: true } }
    );
    res.redirect("/admin/categories");
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

module.exports = {
  categoryManage,
  addCategory,
  createCategory,
  editCategory,
  updateCategory,
  unlistCategory,
  listCategory,
};
