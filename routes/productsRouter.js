const express = require('express')
const router = express.Router()
const upload = require('../config/multer.js')
const productModel = require('../models/product-models.js')



router.post("/create", upload.single("image"), async (req, res) => {
   try {
      let { name,
         price,
         discount,
         bgcolor,
         pannelcolor,
         textcolor } = req.body
      let product = await productModel.create({
         image: req.file.buffer,
         name,
         price,
         discount,
         bgcolor,
         pannelcolor,
         textcolor
      })
     
      req.flash("success", 'product created successfully')
      res. redirect("/owners/admin")
   } catch (error) {
      res.send(err.message)
   }
})

module.exports = router