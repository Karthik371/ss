/** @format */

const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileUrl: {
      type: String,
      required: true,
    },
    imageData: [
      {
        id: String,
        description: String,
        imageUrl: String,
      },
    ],
    faceId: String,
    instaId: String,
    twitterId: String,
    userDesp: String,
    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { curretTime: () => Date.now() },
  }
);

const User = mongoose.model("User", UsersSchema);

module.exports = User;
