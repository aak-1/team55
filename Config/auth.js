module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Please log in to view that resource");
    res.redirect("/users/login");
  },
  // forwardAuthenticated: function (req, res, next) {
  //   if (!req.isAuthenticated()) {
  //     console.log('not authenticated');
  //     return next();
  //   }
  //   res.redirect("/");
  // },
  isAdmin: function (req, res, next) {
    if (!req.user) {
      req.flash("error_msg", "Please log in to view that resource");
    } else if (req.user.accessLevel == "admin") {
      next();
    } else {
      res.redirect("/");
    }
  },
  isVolunteer: function (req, res, next) {
    if (!req.user) {
      req.flash("error_msg", "Please log in to view that resource");
    } else if (
      req.user.accessLevel == "admin" ||
      req.user.accessLevel == "volunteer"
    ) {
      next();
    } else {
      res.redirect("/");
    }
  },
};
