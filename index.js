const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const session  = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('connect-flash');
const csrf= require('csurf');

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

// enable forms
// the express.urlencoded middleware will examine the form data in the request
// and put them into req.body
app.use(
  express.urlencoded({
    extended: false
  })
);

// setup sessions
// Make sure to setup all sessions before your routes
app.use(session({
  store: new FileStore(),  // use files to store sessions
  secret:process.env.SESSION_SECRET_KEY,
  resave: false, // if the client access the web server and there's no change to session data, don't resave the session
  saveUninitialized: true // save a new session for each client that does not have a session 
}))

// enable flash messages
app.use(flash());

// register the custom middle ware to display date and time
app.use(function(req,res, next){
  // all placeholders that are available in a hbs file is in res.locals
  // add a new key to res.locals
  res.locals.current_datetime = new Date();

  // VERY VERY VERY IMPORTANT
  // you must always call next() or res.send/render etc. in a middleware
  next();  // <-- next will send the request to the next middleware in the chain
           // if there are no  other middlewares, then next() will send the request
           // to the route
})

// register the custom middle ware for the flash message
app.use(function(req,res, next){
  // res.locals is an object that store all the placeholders for the hbs file

  // req.flash with one parameter, it retrieves all messages belonging to the
  // category specified by it and also delete it from the session
  res.locals.success_messages = req.flash('success_messages');
  res.locals.error_messages = req.flash('error_messages');
  next();
})

// share the current logged in user with all hbs file
app.use(function(req, res, next){
   res.locals.user = req.session.user; 
   next();
})


// enable csurf
// once enabled, all POST requests must have a csrf token
app.use(csrf());

// add a custom error handler for csrf middleware.
// (must be immediately after app.use(csrf()))
app.use(function(err,req,res,next) {
  // if the function for app.use has 4 parameters
  // it is an error handler. Any error from the previous middleware
  // will be passed to it
  if (err && err.code == "EBADCSRFTOKEN") {
    req.flash("error_messages", "Sorry the form has expired. Please try again");
    res.redirect('back');  // redirect with the 'back' as argument means to go back to the previous page
  } else {
    // if no error, go to the next middleware
    next();
  }
})

// middleware to share the csrf token with all hbs files
app.use(function(req,res,next){
  // req.csrfToken() will return a valid CSRF token
  // and we make it available to all hbs files via `res.locals.csrfToken`
  res.locals.csrfToken = req.csrfToken();
  next();
})

// share the number of items in the shopping cart
app.use(async function(req,res,next){
  if (req.session.user) {
    const cartItems = await getUserCart(req.session.user.id);
    res.locals.cartItemCount = cartItems.toJSON().length;
  } else {
    res.locals.cartItemCount = 0;
  }
  next();
})


// import in the landing routes
const landingRoutes = require('./routes/landing');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cloudinaryRoutes = require('./routes/cloudinary');
const cartRoutes = require('./routes/cart');
const { getUserCart } = require("./services/cart_items");

async function main() {

  // when apply app.use to a router
  // the first parameter is URL prefix,
  // the second parameter is the router itself
    app.use('/', landingRoutes);
    app.use('/products', productRoutes)
    app.use('/users', userRoutes);
    app.use('/cloudinary', cloudinaryRoutes);
    app.use('/cart', cartRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});