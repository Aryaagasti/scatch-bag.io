const express = require('express')
const  router = express.Router()
const {registerUser, loginUser, logout} = require("../controllers/auth-controller.js")
const isLoggedin = require("../middlewares/isLoggedin.js")





router.get("/", (req,res)=>{
   res.send("hey its working")
})

router.post('/register', registerUser )

router.post('/login', loginUser)

router.post('/logout', isLoggedin,logout)

module.exports = router