const express = require('express')
const router = express.Router()
const ownerModel = require('../models/owners-model.js')
const bcrypt = require('bcrypt')


router.get("/admin", (req, res) => {
   let success = req.flash("success", "")
   res.render("createproducts",{success})
})

if (process.env.NODE_ENV === "development") {
   router.post("/create", async (req, res) => {
      try {
         const owners = await ownerModel.find();
         if (owners.length > 0) {
            return res.status(503).send("You don't have permission to create a new owner");
         }
         
         // Extracting owner data from request body
         let { fullname, email, password } = req.body;

         const saltRounds = 10;
         bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
               console.error("Error hashing password:", err);
               return res.status(500).send("An error occurred while creating the owner");
            }

            try {
               // Create the owner with the hashed password
               const createdOwner = await ownerModel.create({
                  fullname,
                  email,
                  password: hash, // Save the hashed password
               });

               res.status(201).send(createdOwner);
            } catch (createError) {
               console.error("Error creating owner:", createError);
               res.status(500).send("An error occurred while creating the owner");
            }
         });
      } catch (error) {
         console.error("Error creating owner:", error); // Log the error for debugging
         res.status(500).send("An error occurred while creating the owner");
      }
   });

   
}

router.post("/login", async (req, res) => {
   const { email, password } = req.body;
   try {
       const owner = await ownerModel.findOne({ email });
       if (!owner) {
           return res.status(401).send("Invalid email or password");
       }
       const isMatch = await bcrypt.compare(password, owner.password);
       if (!isMatch) {
           return res.status(401).send("Invalid email or password");
       }
       const token = jwt.sign({ id: owner._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
       res.cookie('token', token, { httpOnly: true });
       res.redirect("/owners/admin"); // Redirect to /admin after successful login
   } catch (error) {
       console.error("Error logging in owner:", error);
       res.status(500).send("An error occurred while logging in");
   }
});


module.exports = router
