const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Load User model
const { updateStatus, becomeVolunteer } = require("../Controller/user");
const User = require("../models/User");
const { isAdmin, isVolunteer, ensureAuthenticated } = require("../config/auth");
// Login Page
router.get("/login", (req, res) => res.render("login"));
router.get("/profile", async(req, res) => {
  const user = await User.findById(req.user._id);
  res.render("profile", {user})
});

router.get('/admin/updateStatus',async(req,res)=> {
  var users = await User.find({
    $or: [{ accessLevel: "pending" }, { accessLevel: "volunteer" }],
  })
  if(users.length == 0){
    users = []
  }
  res.render('AddTable',{users});
});
// Register Page
router.get("/register", (req, res) =>
  res.render("register")
);

router.put('/updateStatus', isAdmin, updateStatus);
router.put('/becomeVolunteer', ensureAuthenticated, becomeVolunteer);

router.post("/register", (req, res) => {
  console.log(req.body);
  const { phoneNumber, password, name, age, language, gender } = req.body;
  let errors = [];

  if (!phoneNumber || !password || !name || !age || !language || !gender) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (!password && password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  success_msg = undefined;
  if (errors.length > 0) {
    res.render("register", {
      success_msg,
      errors,
      phoneNumber,
      password,
      name,
      age,
      gender,
      language,
    });
  } else {
    User.findOne({ phoneNumber: phoneNumber }).then((user) => {
      if (user) {
        errors.push({ msg: "phoneNumber already exists" });
        res.render("register", {
          errors,
          success_msg,
          phoneNumber,
          password,
          name,
          age,
          gender,
          language,
        });
      } else {
        const newUser = new User({
          success_msg,
          errors,
          phoneNumber,
          password,
          name,
          age,
          gender,
          language,
          accessLevel: "user",
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

router.post("/login", (req, res, next) => {
  console.log(req.body);
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/");
});

module.exports = router;
