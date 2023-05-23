const express = require("express");
const router = express.Router();

// import in the User model
const { User } = require('../models');

const { createUserForm, createLoginForm, bootstrapField } = require('../forms');
const { checkIfAuthenticated } = require("../middlewares");

router.get('/signup', (req,res)=>{
    // display the registration form
    const userForm = createUserForm();
    res.render('users/signup', {
        'form': userForm.toHTML(bootstrapField)
    })
})

router.post('/signup', (req, res) => {
    // step 1: create the form
    const userForm = createUserForm();

    // step 2: process the request
    userForm.handle(req, {
        success: async (form) => {
            // method 0: set by an object

            // const user = new User({
            //     'username': form.data.username,
            //     'password': form.data.password,
            //     'email': form.data.email
            // });

            const user = new User()
            // method 1: set one by one
            user.set('username', form.data.username)
            user.set('email', form.data.email)
            user.set('password', form.data.password)

            // method 2: decompose object
            // const {confirm_password, ...userData} = form.data;
            // user.set(userData);

              
            await user.save();
            req.flash("success_messages", "User signed up successfully!");
            res.redirect('/users/login')
        },
        'error': (form) => {
            res.render('users/signup', {
                'form': form.toHTML(bootstrapField)
            })
        },
        'empty': (form) => {
            res.render('users/signup', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', (req,res)=>{
    res.render('users/login', {
        'form': createLoginForm().toHTML(bootstrapField)
    })
})

router.post('/login', (req,res)=>{
    // step 1: create the form
    const loginForm  = createLoginForm();

    // step 2: process the request
    loginForm.handle(req, {
        'success': async (form) => {
          // 1. check if the username match
          // 2. if username match, check password
          // if two passes, user exists
          // and we use the session for the client to remember that this client exist
            // ...find the user by email and password
            let user = await User.where({
                'username': form.data.username,
                'password': form.data.password
            }).fetch({
                require:false}
            );

            if (!user) {
                // if the user it doesn't exist
                req.flash("error_messages", "Sorry, the authentication details you provided does not work.")
                res.redirect('/users/login');
            } else {
                // if the user exist
                // check if the password matches
                if (user.get('password') === form.data.password) {
                    // add to the session that login succeed
                    // store the user details
                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    }
                    req.flash("success_messages", "Welcome back, " + user.get('username'));
                    res.redirect('/products');
                } else {
                    req.flash("error_messages", "Sorry, the authentication details you provided does not work.")
                    res.redirect('/users/login')
                }
            }
        },
        'error': (form) => {
            req.flash("error_messages", "There are some problems logging you in. Please fill in the form again")
            res.render('users/login', {
                'form': form
            })
        },
        'empty': (form) => {
            res.render('users/login', {
                'form': form
            })
        }
    })
})

// show the info of the current loggin user
// before the req, res executed, middleware checkIfAuthenticated runs first
router.get('/profile',checkIfAuthenticated,  (req, res) => {
    const user = req.session.user;
    res.render('users/profile', {
        'user' : user
    })
})


module.exports = router;
