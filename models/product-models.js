const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    bgcolor: String,
    panelcolor: String,
    textcolor: String,
    discount:{
        type: Number,
        default: 0,
    },
    image: Buffer  // Assuming you are storing image as buffer
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
