const express = require('express')
const usersRouter = express();
const userControler = require('../controllers/user-ctrl')
const cartControler = require('../controllers/cart-ctrl')
const addressControler = require('../controllers/address-ctrl')
const searchControler = require('../controllers/search-ctrl')
const orderControler = require('../controllers/user-order-ctrl')

const middleware = require("../middleware/user-mid")
const upload = require("../middleware/user-img")

usersRouter.set('viwes', '../views/user')
usersRouter.set('view engine','hbs')

/* GET user*/
usersRouter.get("/", userControler.getHome);
usersRouter.get("/signup", middleware.userValidation, userControler.getSignup);
usersRouter.get("/otp", userControler.getOtp);
usersRouter.get("/games", userControler.getGames);
usersRouter.get("/consoles", userControler.getConsoles);
usersRouter.get("/accessories", userControler.getAccessories);
usersRouter.get("/profile", middleware.sessionValidation, userControler.getProflie);
usersRouter.get("/productview/:id", userControler.productView);

/* Action*/
usersRouter.post("/submit", userControler.sendOtp);
usersRouter.get("/resend", userControler.reSendOtp);
usersRouter.get("/reotp", userControler.reOtp);
usersRouter.post("/login", userControler.userLogin);
usersRouter.get("/forgot", userControler.forgotPass);
usersRouter.post("/resetpass", userControler.setPass);
usersRouter.post("/loginotp", userControler.checkUser);
usersRouter.post("/setpass", userControler.updatePass);
usersRouter.post("/check", userControler.checkOtp);
usersRouter.get("/logout", userControler.userLogout);

usersRouter.get("/wallethistory", middleware.sessionValidation, userControler.walletHistory);

usersRouter.post("/addtocart/:id", middleware.sessionValidation, cartControler.addCart);
usersRouter.post("/addtowish/:id", middleware.sessionValidation, cartControler.addWish);
   
usersRouter.patch("/plus", middleware.sessionValidation, cartControler.plusQuantity);
usersRouter.patch("/minus", middleware.sessionValidation, cartControler.minusQuantity);
usersRouter.get("/delete/:id", middleware.sessionValidation, cartControler.deleteItem);
usersRouter.get("/deletewish/:id", middleware.sessionValidation, cartControler.deleteWishItem);

usersRouter.get("/gocart", middleware.sessionValidation, cartControler.goToCart);
usersRouter.get("/gowish", middleware.sessionValidation, cartControler.goToWish);
usersRouter.get("/gocheckout", middleware.sessionValidation, userControler.goToCheckout);

usersRouter.post("/coupon", middleware.sessionValidation, userControler.applyCoupon);
usersRouter.get("/removecoupon", middleware.sessionValidation, userControler.removeCoupon);

usersRouter.post("/confirmation", middleware.sessionValidation, orderControler.confirmation);
usersRouter.post("/verifyPayment", middleware.sessionValidation, orderControler.userVerifypayment);
usersRouter.get("/goconfirmation", middleware.sessionValidation, orderControler.goToConfirmation);
usersRouter.get("/cancel/:id", middleware.sessionValidation, orderControler.cancelOrder);
usersRouter.get("/return/:id", middleware.sessionValidation, orderControler.returnProduct);
usersRouter.get("/vieworders/:id", middleware.sessionValidation, orderControler.viewOrders);

usersRouter.post("/userimage", middleware.sessionValidation, upload.array("image",1), addressControler.addUserImage);
usersRouter.post("/userdetails", middleware.sessionValidation, addressControler.addUserDetails);

usersRouter.get("/selected/:id", middleware.sessionValidation, userControler.selectedAddress);
usersRouter.get("/deletedata/:id", middleware.sessionValidation, userControler.deleteUserData);
usersRouter.get("/editdata/:id", middleware.sessionValidation, userControler.editUserData);
usersRouter.post("/updatedetails", middleware.sessionValidation, userControler.updateUserDetails);

usersRouter.post("/searchproducts", searchControler.searchProducts);
usersRouter.post("/searchgames", searchControler.searchGames);
usersRouter.post("/searchconsoles", searchControler.searchConsoles);
usersRouter.post("/searchaccessories", searchControler.searchAccessories);

// Middleware function for handling 404 errors
function handle404(req, res) {
    res.render("user/404", {
        user: true,
      })
}
  
// Register the middleware function at the end of the router
usersRouter.use(handle404);

module.exports = usersRouter;