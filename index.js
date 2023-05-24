const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
// 14th dec, session
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);
const baseModule = require("hbs");
const csrf = require('csurf')
const jwt = require('jsonwebtoken');
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

// 20 dec
// proxy middleware to pass csrf to stripe post
const csrfInstance = csrf();
app.use(function(req,res,next){
  // check if the url we are accessing should excluded from csrf protection
  // here we are not passing csrf to req
  // the \\ is to exclude api call to make it restful
  if (req.url == "./checkout/process_payment" || req.url.slice(0,5) == '/api/') {
    return next();
  }
  csrfInstance(req,res,next); // implement protection for all other routes
})

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
  // dec 20 if we use proxy middleware, the req.csrf token might be undefined, because these routes are excluded from csrf
  // so we need to check 

  if (req.csrfToken) {
    // req.csrfToken() will return a valid CSRF token
    // and we make it avaliable to all hbs file via  `res.locals.csrfToken`
    res.locals.csrfToken = req.csrfToken();
  }
  next();
})
// then go to hbs files to put csrf token in the form using hidden input
/*{ <input type="hidden" name="_csrf" value="{{csrfToken}}"/> }*/

// import in the landing routes
const landingRoutes = require('./routes/landing')
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cloudinaryRoutes = require('./routes/cloudinary')
const cartRoutes = require('./routes/cart')
const { getUserCart } = require("./services/cart_items");
const checkoutRoutes = require('./routes/checkout')

// register restful api
const api = {products: require('./api/products'),
             users:require('./api/users')}

async function main() {

  // when apply app.use to a router
  // the first parameter is URL prefix,
  // the second parameter is the router itself
    app.use('/', landingRoutes);
    app.use('/products', productRoutes)
    app.use('/users', userRoutes)
    app.use('/cloudinary', cloudinaryRoutes)
    app.use('/cart', cartRoutes)
    app.use('/checkout', checkoutRoutes)

    // use restful api
    // add expres.json. specify all the routes will be using express.json middleware
    app.use('/api/products',express.json(), api.products);
    app.use('/api/users',express.json(), api.users);

}

// share the current logged in user with all hbs file
app.use(function(req,res, next){
  res.locals.user = req.session.user;
  next()
})

// share the number of items in the shopping cart across the website
app.use(async function(req,res, next){
  // if user is logged in, in the session file
  if (req.session.user){
    const cartItems = await getUserCart(req.session.user.id);
    res.locals.cartItemCount = cartItems.toJSON().length;
  } else {
    res.locals.cartItemCount = 0 ;
  }
  next()
  }
)

main();

app.listen(3333, () => {
  console.log("Server has started, listen on 3333");
});