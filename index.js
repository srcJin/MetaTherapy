const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
// 14th dec, session
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);


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
  secret: 'keyboard cat', // encrypt the session id
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


// import in the landing routes
const landingRoutes = require('./routes/landing')
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

const baseModule = require("hbs");
async function main() {

  // when apply app.use to a router
  // the first parameter is URL prefix,
  // the second parameter is the router itself
    app.use('/', landingRoutes);
    app.use('/products', productRoutes)
    app.use('/users', userRoutes)

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