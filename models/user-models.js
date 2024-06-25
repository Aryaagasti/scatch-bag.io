const mongoose = require('mongoose')


const UserSchema = new mongoose.Schema({

    fullname: {
        type: String,
        minLength: 3,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    cart: [{
        type: mongoose.Schema.Types.ObjectId, // Assuming the cart can contain different types of items
        ref: "Product"
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    contact: {
        type: Number,
    },
    picture: {
        type: String, // Storing picture as binary data
        required: false
    }

})



const User = mongoose.model("User", UserSchema)
module.exports = User