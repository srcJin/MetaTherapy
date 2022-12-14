const checkIfAuthenticated = function(req,res, next){
      // we can always access the session with `req.session`
      if (req.session.user) {
        next();
    } else {
        req.flash('error_messages', 'Sorry you are not authorized to view this page');
        res.redirect('/users/login');
    }
}

module.exports = {checkIfAuthenticated};