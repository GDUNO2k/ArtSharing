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
    return res.redirect("/auth/login?ref=" + req.url);
  }

  next();
}

// redirect if logged in user is not admin
function requireAdmin(req,res,next) {
  if(req.user.role !== "admin") {
    return res.redirect("/unauthorized")
  }
  next();
}

module.exports = {
  getUser,
  requireLogin,
  requireAdmin,
}