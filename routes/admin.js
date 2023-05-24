const express = require('express')
const adminRouter = express();
const adminControler = require('../controllers/admin-ctrl')
const productControler = require('../controllers/product-ctrl')
const categoryControler = require('../controllers/category-ctrl')
const coupenControler = require('../controllers/coupon-ctrl')
const orderControler = require('../controllers/admin-order-ctrl')

const middleware = require("../middleware/admin-mid")
const upload = require("../middleware/multer-mid")


adminRouter.set('viwes', '../views/admin')
adminRouter.set('view engine', 'hbs')

/* GET admin*/
adminRouter.get("/", middleware.adminlogin, adminControler.getLogin);
adminRouter.get("/home", middleware.adminValidation, adminControler.getHome);
adminRouter.get("/userdata", middleware.adminValidation, adminControler.getUserData);
adminRouter.get("/orders", middleware.adminValidation, orderControler.orderMange);
adminRouter.get("/categories", middleware.adminValidation, categoryControler.categoryManage);
adminRouter.get("/products", middleware.adminValidation, productControler.ptoductMange);
adminRouter.get("/coupons", middleware.adminValidation, coupenControler.coupenMange);

adminRouter.post("/bydate", middleware.adminValidation, adminControler.filterByDate);

/* Action*/
adminRouter.post("/login", adminControler.adminLogin);
adminRouter.get("/logout", adminControler.adminLogout);
adminRouter.get("/block/:id", middleware.adminValidation, adminControler.blockUser);
adminRouter.get("/unblock/:id", middleware.adminValidation, adminControler.unBlockUser);
adminRouter.get("/addproduct", middleware.adminValidation, productControler.addProduct);

adminRouter.get("/addcategory", middleware.adminValidation, categoryControler.addCategory);
adminRouter.post("/creatcategory", middleware.adminValidation, categoryControler.createCategory);

adminRouter.get("/addcoupon", middleware.adminValidation, coupenControler.addCoupon);
adminRouter.post("/createcoupon", middleware.adminValidation, coupenControler.createCoupon);

/* Product Action*/
adminRouter.post("/add", middleware.adminValidation, upload.array("image"), productControler.add);
adminRouter.get("/edit/:id", middleware.adminValidation, productControler.edit);
adminRouter.post("/update", middleware.adminValidation, upload.array("image"), productControler.update);
adminRouter.post("/deleteimage", middleware.adminValidation, upload.array("image"), productControler.deleteImage);
adminRouter.get("/unlist/:id", middleware.adminValidation, productControler.unlistProduct);
adminRouter.get("/list/:id", middleware.adminValidation, productControler.listProduct);

/* Category Action*/
adminRouter.get("/editcate/:id", middleware.adminValidation, categoryControler.editCategory);
adminRouter.post("/updatecate", middleware.adminValidation, categoryControler.updateCategory);
adminRouter.get("/unlistcate/:id", middleware.adminValidation, categoryControler.unlistCategory);
adminRouter.get("/listcate/:id", middleware.adminValidation, categoryControler.listCategory);

/* Coupon Action*/
adminRouter.get("/editcoupon/:id", middleware.adminValidation, coupenControler.editCoupon);
adminRouter.post("/updatecoupon", middleware.adminValidation, coupenControler.updateCoupon);
adminRouter.get("/unlistcoupon/:id", middleware.adminValidation, coupenControler.unlistCoupon);
adminRouter.get("/listcoupon/:id", middleware.adminValidation, coupenControler.listCoupon);

/* Order Action*/
adminRouter.get("/delivered/:id", middleware.adminValidation, orderControler.orderDelivered);
adminRouter.get("/accepted/:id", middleware.adminValidation, orderControler.acceptReturn);
adminRouter.get("/canceled/:id", middleware.adminValidation, orderControler.canceleReturn);
adminRouter.get("/vieworders/:id", middleware.adminValidation, orderControler.viewOrders);

// Middleware function for handling 404 errors
function handle404(req, res) {
    res.render("user/404", {
        adHome: true,
      })
}
  
// Register the middleware function at the end of the router
adminRouter.use(handle404);

module.exports = adminRouter;