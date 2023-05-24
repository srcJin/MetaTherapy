const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
// 14th dec, session
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);
const baseModule = require("hbs");
const csrf = require('csurf')
require("dotenv").config();

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// Use middleware

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);




// set up sessions before you import your routes
app.use(session({
  store: new FileStore(), // use files to store sessions
  secret: process.env.SESSION_SECRET_KEY, // encrypt the session id
  resave: false, // if the client access the web server, and no change to session, don't resave the session
  saveUninitialized: true // save a new session for each client that does not have a session
}))


app.use(flash())

// Register Flash middleware
// Flash related to base.hbs

// note: when req.flash receive a message (success/error), 
// it will remove all the previous message stored in the session file

app.use(function (req, res, next) {
    // res.locals is an object that store all the placeholders for the hbs file
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    // IMPORTANT!!
    // must always call next() or res.send/render in a middleware 
    next();
});

// 15 dec 
// enable csurf
// once enabled, all POST requests must have a csrf token

app.use(csrf())
// add a custom error handler for csrf middleware
// must be immediately after app.use(csrf())
app.use(function (err, req, res, next) {
  if (err && err.code == "EBADCSRFTOKEN") {
      req.flash('error_messages', 'The form has expired. Please try again');
      res.redirect('back');
  } else {
      next()
  }
});


// create a middleware to share the csrf token with all hbs files
app.use(function(req,res,next){
  res.locals.csrfToken = req.csrfToken();
  next();
})
// then go to hbs files to put csrf token in the form using hidden input
/*{ <input type="hidden" name="_csrf" value="{{csrfToken}}"/> }*/

// import in the landing routes
const landingRoutes = require('./routes/landing')
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cloudinaryRoutes = require('./routes/cloudinary')

async function main() {

  // when apply app.use to a router
  // the first parameter is URL prefix,
  // the second parameter is the router itself
    app.use('/', landingRoutes);
    app.use('/products', productRoutes)
    app.use('/users', userRoutes)
    app.use('/cloudinary', cloudinaryRoutes)
}

// share the current logged in user with all hbs file
app.use(function(req,res, next){
  res.locals.user = req.session.user;
  next()
})


main();

app.listen(8888, () => {
  console.log("Server has started, listen on 8888");
});