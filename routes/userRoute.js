/** @format */

const express = require("express");
const router = express.Router();
let jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../models/userModel");
const Image = require("../models/ImageModel");
const passport = require("passport");
const gravatar = require("gravatar");

router.post("/login", (req, res, next) => {
  passport.authenticate("local", function (err, user) {
    if (err) {
      return console.log(err);
    }
    if (!user) {
      return res.json({ auth: false, message: "User not found" });
    }
    req.logIn(user, function (err) {
      if (err) {
        return console.log(err);
      }
      const userData = {
        username: user.name,
        email: user.email,
        profileUrl: user.profileUrl,
      };
      let token = jwt.sign({ user: userData.username }, "shhhh");

      return res.json({ auth: true, value: userData, token: token });
    });
  })(req, res, next);
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  let profileUrl = gravatar.url(email, { s: "100", r: "x", d: "retro" }, true);
  let username = name.replace(/ /g, "");

  try {
    const userNameExists = await User.findOne({ name: username });
    if (userNameExists) return res.json({ message: "username exists" });

    const userExists = await User.findOne({ email: email });
    if (userExists) return res.json({ message: "Email exists" });

    let date = new Date();

    const user = new User({
      name: username,
      email,
      profileUrl: profileUrl,
      password,
      date: date.toLocaleDateString(),
    });

    bcrypt.hash(user.password, saltRounds, async function (err, hash) {
      if (err) console.log(err);
      user.password = hash;
      await user.save();
    });

    res.json({ auth: true, message: "user saved" });
  } catch (error) {
    res.status(401);
  }
});

router.get("/search", (req, res) => {
  console.log(req.user);
  if (req.user) {
    return res.json({ auth: true, value: req.user });
  } else {
    return res.json({ auth: false, value: req.user });
  }
});
router.get("/userdetails", async (req, res) => {
  res.json({ token: req.session.passport });
});
router.post("/update/:id", async (req, res) => {
  const data = req.body;
  const id = req.params.id;
  console.log(data);
  try {
    if (req.user) {
      const update = await User.updateOne(
        { name: id },
        {
          faceId: data.facebookid,
          instaId: data.instaid,
          twitterId: data.twitterid,
          userDesp: data.userdesp,
        }
      );
    }
    res.json({ update: true });
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
});

router.get("/person/:id", (req, res) => {
  if (req.user) {
    return res.json({ auth: true, value: req.user });
  } else {
    return res.json({ auth: false });
  }
});
router.get("/user/:id", async (req, res) => {
  const name = req.params.id;
  let userDeatils = await User.findOne({ name: name });
  if (userDeatils) {
    if (req.user && req.user.username === name) {
      return res.json({ auth: true, user: userDeatils });
    } else {
      return res.json({ auth: false, user: userDeatils });
    }
  }

  // if (req.user) {
  //   return res.json({ auth: true, value: req.user });
  // } else {
  //   return res.json({ auth: false });
  // }
});
router.get("/logout", (req, res) => {
  req.logout();
  return res.json({ auth: false });
});

router.post("/user/:id", async (req, res) => {
  const username = req.params.id;

  const body = req.body;

  try {
    User.updateOne(
      { name: username },
      {
        $push: {
          imageData: {
            $each: [
              {
                id: body.id,
                description: body.description,
                imageUrl: body.url,
              },
            ],
          },
        },
      },
      (err, foundPost) => {
        if (err) console.log(err);
      }
    );
    const userExists = await User.findOne({ name: username });
    if (userExists) {
      const image = new Image({
        name: userExists.name,
        description: body.description,
        profileUrl: userExists.profileUrl,
        imageUrl: body.url,
      });
      await image.save();
    }
  } catch (error) {
    console.log(error);
  }
});

router.put("/user/:id", async (req, res) => {
  const name = req.params.id;

  try {
    const Update = await User.updateOne(
      { name: name },
      { profileUrl: req.body.url }
    );
    const imageUpdate = await Image.updateOne(
      { name: name },
      { profileUrl: req.body.url }
    );
  } catch (error) {
    console.log(error);
  }
});

router.get("/uploads", async (req, res) => {
  try {
    const data = await Image.find({});
    res.json({ imageData: data });
  } catch (error) {
    console.log(data);
  }
});
module.exports = router;
