const User = require("../modals/user-model");
const Category = require("../modals/category-model");
const Product = require("../modals/product-model");

const cloudinary = require("../middleware/cloudinary-mid")

/* Ptoduct Mange*/
const ptoductMange = async function (req, res, next) {
  try {
    const productInfo = await Product.find().populate("category").lean();
    res.render("admin/product-manage", {
      adHome: true,
      userData: true,
      productInfo,
    });
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* Add Product*/
const addProduct = async function (req, res, next) {
  try {
    let allcategorys = await Category.find().lean();
    res.render("admin/add-product", {
      adHome: true,
      action: true,
      allcategorys,
    });
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* Add Product*/
const add = async function (req, res, next) {
  try {
    const { productname, category, price, disprice, description, stock } = req.body;
    const findcategory = await Category.findOne({ name: category });
    const categoryId = findcategory._id;

    let images = [];
    let imgerr = false;
    let notimg = false;

    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.filename);
      const invalidFile = req.files.find(
        (file) => file.mimetype !== "image/jpeg" && file.mimetype !== "image/png"
      );
      if (invalidFile) {
        imgerr = true;
      }
    } else {
      notimg = true;
    }

    if (imgerr || notimg) {
      // Render the form again with error messages
      const categories = await Category.find();
      res.render("admin/add-product", {
        adHome: true,
        action: true,
        categories,
        productname,
        category,
        price,
        disprice,
        description,
        imgerr,
        notimg,
      });
      return;
    }

    const productData = await Product.create({
      productname,
      category: categoryId,
      categoryname: category,
      price,
      disprice,
      description,
      stock,
      image: images,
    });

    const objectId = productData._id;
    const uniqueId = objectId.toString();
    const productid = uniqueId.substring(19, 24);
    await Product.updateOne({ _id: objectId }, { $set: { productid } });
    res.redirect("/admin/products");
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* Edit Product*/
let productID;
const edit = async function (req, res, next) {
  try {
    productID = req.params.id
    const findOneProduct = await Product.findOne({ _id: productID })
      .populate("category")
      .lean();
    let allcategorys = await Category.find().lean();
    res.render("admin/edit-product.hbs", {
      adHome: true,
      action: true,
      findOneProduct,
      allcategorys,
    });
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* Update Product*/
const update = async function(req, res, next) {
  try {
    const productId = req.body.id;
    const categoryName = req.body.category;
    const productName = req.body.productname;
    const category = await Category.findOne({ name: categoryName });
    let images = [];
    if (req.files && req.files.length > 0) {
      const existingProduct = await Product.findById(productId);
      images = existingProduct.image;
      req.files.forEach(file => {
        images.push(file.filename);
      });
    await Product.updateOne(
      { _id: productId },
      {
        $set: {
          productname: productName,
          category: category._id,
          categoryname: categoryName,
          price: req.body.price,
          disprice: req.body.disprice,
          description: req.body.description,
          stock: req.body.stock,
          image: images
        },
      }
    );
    res.redirect("/admin/products");
    }
    else{
      await Product.updateOne(
        { _id: productId },
        {
          $set: {
            productname: productName,
            category: category._id,
            categoryname: categoryName,
            price: req.body.price,
            disprice: req.body.disprice,
            description: req.body.description,
            stock: req.body.stock,
          },
        }
      );
      res.redirect("/admin/products");
    }
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* Delete image*/
const deleteImage = async function (req, res, next) {
  try {
    await Product.updateOne({  _id: productID }, { $pull: { image: req.body.img } });
    res.redirect("/admin/products");
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* unlist Product*/
const unlistProduct = async function (req, res, next) {
  try {
    await Product.updateOne(
      { _id: req.params.id },
      { $set: { active: false } }
    );
    res.redirect("/admin/products");
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* list product*/
const listProduct = async function (req, res, next) {
  try {
    await Product.updateOne({ _id: req.params.id }, { $set: { active: true } });
    res.redirect("/admin/products");
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

module.exports = {
  ptoductMange,
  addProduct,
  add,
  edit,
  update,
  deleteImage,
  unlistProduct,
  listProduct,
};
