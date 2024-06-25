const mongoose = require('mongoose')

const ImageSchema = new mongoose.Schema({

    filename: String,
    originalname: String,
    mimetype: String,
    path: String,
    buffer: Buffer,
    size: Number

},{timestamps: true})

const Image = mongoose.model("Image", ImageSchema)
module.exports = Image