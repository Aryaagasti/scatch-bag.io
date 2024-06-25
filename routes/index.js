const express = require("express");
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedin.js");
const productModel = require("../models/product-models.js");
const userModel = require("../models/user-models.js")
const multer = require("../config/multer.js")
const upload = require('../config/multer.js')
const orderModel = require("../models/order-model.js")


router.get("/", (req, res) => {
    let error = req.flash("error");
    res.render("index", { error, loggedin: false });
});

router.get("/shop", isLoggedin, async (req, res) => {
    try {
        let products = await productModel.find();
        let success = req.flash("success")
        res.render("shop", { products, success }); // Pass products to the view
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Server error");
    }
});

router.get("/logout", isLoggedin, (req, res) => {
    res.clearCookie("token");
    req.flash("success", "You have logged out successfully");
    res.redirect("/");
});

router.get("/addtocart/:id", isLoggedin, async (req, res) => {
  try {
      let user = await userModel.findOne({ email: req.user.email });
      
      if (!user) {
          req.flash("error", "User not found");
          return res.redirect("/shop");
      }

      // Check if product is already in the cart
      if (!user.cart.includes(req.params.id)) {
          user.cart.push(req.params.id);
      } else {
          req.flash("error", "Product already in cart");
      }

      await user.save();
      req.flash("success", "Added to cart");
      res.redirect("/shop");
  } catch (error) {
      console.error("Error adding product to cart:", error);
      res.status(500).send("Server error");
  }
});

router.post("/cart/delete/:id", isLoggedin, async(req,res)=>{
    try {
        let user = await userModel.findOne({email:req.user.email})
        if(!user){
            req.flash("error", "user not found")
            return res.redirect("/cart")
        }
        user.cart= user.cart.filter(itemId => itemId.toString() !== req.params.id)
        await user.save()

        req.flash("success","Item removed from cart")
        res.redirect("/cart")
    } catch (error) {
        console.error("Error deleting product from cart:", error);
    res.status(500).send("Server error");
    }
})
  


// View cart
router.get('/cart', isLoggedin, async (req, res) => {
  let user = await userModel.findOne({email: req.user.email}).populate("cart");
  
  let totalBill = 0;
  let cartItems = user.cart.map(item => {
      let bill = Number(item.price) + 20 - Number(item.discount);
      totalBill += bill;
      return { ...item.toObject(), bill };
  });

  res.render("cart", { user, cartItems, totalBill });
});

// My Account route
router.get('/my-account', isLoggedin, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        const orders = await orderModel.find({ userId: req.user._id }).populate('items.product');
        res.render('my-account', { user, orders });
    } catch (error) {
        console.error('Error fetching account details:', error);
        res.status(500).send('Server error');
    }
});


//profile image upload route
router.post('/users/upload-profile-image', isLoggedin, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            req.flash('error', 'Please upload a valid image');
            return res.redirect('/my-account');
        }

        const user = await userModel.findById(req.user._id);
        user.profileImage = req.file.filename;
        await user.save();
        req.flash('success', 'Profile image updated successfully');
        res.redirect('/my-account');
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).send('Server error');
    }
});

// Add success and cancel routes
router.get('/success', isLoggedin, (req, res) => {
    res.send('Payment successful. Thank you for your purchase!');
});

router.get('/cancel', isLoggedin, (req, res) => {
    res.send('Payment cancelled. Please try again.');
});





module.exports = router;
