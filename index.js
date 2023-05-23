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



// import in the landing routes
const landingRoutes = require('./routes/landing')
const productRoutes = require('./routes/products');
async function main() {

  // when apply app.use to a router
  // the first parameter is URL prefix,
  // the second parameter is the router itself
    app.use('/', landingRoutes);
    app.use('/products', productRoutes)
}

main();

app.listen(8888, () => {
  console.log("Server has started, listen on 8888");
});