/** @format */

const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  name: String,
  profileUrl: String,
  description: { type: String, trim: true },
  imageUrl: String,
});

const Image = mongoose.model("Image", ImageSchema);
module.exports = Image;
