const AsyncHandler = require("express-async-handler");
const User = require("../Models/User");

//@desc make user admin / volunteer
//@route PUT api/users/makeAdmin/:id
//@access PRIVATE/ADMIN
exports.updateStatus = AsyncHandler(async (req, res) => {
  try {
    const id = req.body.id;
    const accessLevel = req.body.accessLevel;
    const user = await User.findById(id);
    if (!user) {
      const error = "Invalid user Id";
      res.render("/", error);
    } else {
      user.accessLevel = accessLevel;
      await user.save();
      res.redirect("/admin/updateStatus");
    }
  } catch (err) {
    console.log("MAKE ADMIN : ", err);
    const error = "Cannot get User!";
    res.render("/", error);
  }
});

//@desc get volunteers/ pending
//@route GET api/users/admin/users
//@access PRIVATE/ADMIN
exports.usersTable = AsyncHandler(async (req, res) => {
  try {
    const users = await User.find({
      $or: [{ accessLevel: "pending" }, { accessLevel: "volunteer" }],
    });
    res.render("users", users);
  } catch (err) {
    console.log("GET USER TABLE : ", err);
    const error = "Cannot get User!";
    res.render("user", error);
  }
});

//@desc get volunteers/ pending
//@route PUT api/users/admin/users
//@access PRIVATE/ADMIN
exports.usersTable = AsyncHandler(async (req, res) => {
  try {
    const users = await User.find({
      $or: [{ accessLevel: "pending" }, { accessLevel: "volunteer" }],
    });
    res.render("users", users);
  } catch (err) {
    console.log("GET USER TABLE : ", err);
    const error = "Cannot get User!";
    res.render("user", error);
  }
});

//@desc put user to queue
//@route PUT api/user/becomeVolunteer
//@access PRIVATE
exports.becomeVolunteer = AsyncHandler(async (req, res) => {
  console.log('here');
  if (!req.user || req.user.accessLevel != "user") {
    res.redirect("/");
  } else {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        res.redirect("/");
      } else {
        user.accessLevel = "pending";
        await user.save();
        res.redirect("/");
      }
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  }
});
