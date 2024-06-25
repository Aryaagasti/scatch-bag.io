const mongoose = require('mongoose')

const OwnerSchema = new mongoose.Schema({

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
    products: {
        type: Array, // Assuming orders can contain different types of items
        default: []
    },
    picture: {
        type: String, // Storing picture as binary data
        required: false
    },
    gstin: {
        type: String
    }

})

const Owner = mongoose.model("Owner", OwnerSchema)
module.exports = Owner