const Product = require("../modals/product-model");

/* Search Products*/
const searchProducts = async function (req, res) {
  try {
    const searchQuery = req.body.search;
    const minPrice = parseInt(req.body.min, 10) || 100;
    const maxPrice = parseInt(req.body.max, 10) || 50000;

    const sortOrder = req.body["choices-single-defaul"];
    let sortParams = {};
    if (sortOrder === "Ascending") {
      sortParams = { productname: 1 };
    } else if (sortOrder === "Descending") {
      sortParams = { productname: -1 };
    } else if (sortOrder === "Low to High") {
      sortParams = { price: 1 };
    } else if (sortOrder === "High to Low") {
      sortParams = { price: -1 };
    }

    const gamesInfo = await Product.find({
      categoryname: "Games",
      productname: { $regex: searchQuery, $options: "i" },
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .sort(sortParams)
      .lean();

    const consolesInfo = await Product.find({
      categoryname: "Consoles",
      productname: { $regex: searchQuery, $options: "i" },
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .sort(sortParams)
      .lean();

    const accessoriesInfo = await Product.find({
      categoryname: "Accessories",
      productname: { $regex: searchQuery, $options: "i" },
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .sort(sortParams)
      .lean();

    const gamesNotFond = !gamesInfo.length;
    const consolesNotFond = !consolesInfo.length;
    const accessoriesNotFond = !accessoriesInfo.length;

    res.render("user/home", {
      user: true,
      gamesInfo,
      consolesInfo,
      accessoriesInfo,
      gamesNotFond,
      consolesNotFond,
      accessoriesNotFond,
      searchQuery,
      minPrice,
      maxPrice,
    });
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    res.status(500).send({ error: "Internal Server Error" });
    console.log(error);
  }
};

/* Search Games*/
const searchGames = async function (req, res) {
  try {
    const searchQuery = req.body.search;
    const minPrice = parseInt(req.body.min, 10) || 100;
    const maxPrice = parseInt(req.body.max, 10) || 50000;

    const sortOrder = req.body["choices-single-defaul"];
    let sortParams = {};
    if (sortOrder === "Ascending") {
      sortParams = { productname: 1 };
    } else if (sortOrder === "Descending") {
      sortParams = { productname: -1 };
    } else if (sortOrder === "Low to High") {
      sortParams = { price: 1 };
    } else if (sortOrder === "High to Low") {
      sortParams = { price: -1 };
    }

    const gamesInfo = await Product.find({
      categoryname: "Games",
      productname: { $regex: searchQuery, $options: "i" },
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .sort(sortParams)
      .lean();

    const gamesNotFond = !gamesInfo.length;

    res.render("user/games", {
      user: true,
      gamesInfo,
      gamesNotFond,
      searchQuery,
      minPrice,
      maxPrice,
    });
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    res.status(500).send({ error: "Internal Server Error" });
    console.log(error);
  }
};

/* Search Consoles*/
const searchConsoles = async function (req, res) {
  try {
    const searchQuery = req.body.search;
    const minPrice = parseInt(req.body.min, 10) || 100;
    const maxPrice = parseInt(req.body.max, 10) || 50000;

    const sortOrder = req.body["choices-single-defaul"];
    let sortParams = {};
    if (sortOrder === "Ascending") {
      sortParams = { productname: 1 };
    } else if (sortOrder === "Descending") {
      sortParams = { productname: -1 };
    } else if (sortOrder === "Low to High") {
      sortParams = { price: 1 };
    } else if (sortOrder === "High to Low") {
      sortParams = { price: -1 };
    }

    const consolesInfo = await Product.find({
      categoryname: "Consoles",
      productname: { $regex: searchQuery, $options: "i" },
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .sort(sortParams)
      .lean();

    const consolesNotFond = !consolesInfo.length;

    res.render("user/consoles", {
      user: true,
      consolesInfo,
      consolesNotFond,
      searchQuery,
      minPrice,
      maxPrice,
    });
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    res.status(500).send({ error: "Internal Server Error" });
    console.log(error);
  }
};

/* Search Accessories*/
const searchAccessories = async function (req, res) {
  try {
    const searchQuery = req.body.search;
    const minPrice = parseInt(req.body.min, 10) || 100;
    const maxPrice = parseInt(req.body.max, 10) || 50000;

    const sortOrder = req.body["choices-single-defaul"];
    let sortParams = {};
    if (sortOrder === "Ascending") {
      sortParams = { productname: 1 };
    } else if (sortOrder === "Descending") {
      sortParams = { productname: -1 };
    } else if (sortOrder === "Low to High") {
      sortParams = { price: 1 };
    } else if (sortOrder === "High to Low") {
      sortParams = { price: -1 };
    }

    const accessoriesInfo = await Product.find({
      categoryname: "Accessories",
      productname: { $regex: searchQuery, $options: "i" },
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .sort(sortParams)
      .lean();

    const accessoriesNotFond = !accessoriesInfo.length;

    res.render("user/accessories", {
      user: true,
      accessoriesInfo,
      accessoriesNotFond,
      searchQuery,
      minPrice,
      maxPrice,
    });
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    res.status(500).send({ error: "Internal Server Error" });
    console.log(error);
  }
};

module.exports = {
  searchProducts,
  searchGames,
  searchConsoles,
  searchAccessories,
};
