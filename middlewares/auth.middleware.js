const User = require('../models/user.model');

// req.user = logged in user
async function getUser(req, res, next) {
  if (req.session.email) {
    
    // get user by email
    const user = await User.findOne({ email: req.session.email });

    req.user = user;
  }

  next();
}

// redirect to login if not logged in
function requireLogin(req, res, next) {
  if (!req.user) {
    return res.redirect("/auth/login");
  }

  next();
}

module.exports = {
  getUser,
  requireLogin
}