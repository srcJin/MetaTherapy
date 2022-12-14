const express = require('express');
const { createUserForm, bootstrapField, createLoginForm } = require('../forms');
const { checkIfAuthenticated } = require('../middlewares');
const { User } = require('../models');
const crypto = require('crypto'); // you don't need yarn add this
const router = express.Router();

function getHashedPassword(password) {
    const sha256 = crypto.createHash("sha256");
    const hash = sha256.update(password).digest('base64');  // when we hash a string, we get a very very very number
                                                            // changing it to base64 will shorten
                                                            // base64 --- hexdecimial (0 - F)
    return hash;
}

// display the sign up form
router.get('/signup', function(req,res){
    const userForm = createUserForm();
    res.render('users/signup',{
        'form': userForm.toHTML(bootstrapField)
    })
})

router.post('/signup', function(req,res){
    // step 1: create the form
    const userForm = createUserForm();

    // step 2: process the request
    userForm.handle(req, {
        'success': async function(form) {
            // step 3: create a new instance of the User model
            const user = new User();  // represents one NEW row in the users table
            // user.set('username', form.data.username);
            // user.set('email', form.data.email);
            // user.set('password', form.data.password);
            // instead of:
            const {confirm_password, ...userData} = form.data;
            userData.password = getHashedPassword(userData.password);
            user.set(userData);
        
            await user.save();
            req.flash('success_messages', 'Your account has been created');
            res.redirect('/users/login');

        },
        'error': function(form) {
            res.render('users/signup',{
                'form': form.toHTML(bootstrapField)
            })
        },
        'empty':function(form){
            res.render('users/signup',{
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', function(req,res){
    res.render('users/login', {
        'form': createLoginForm().toHTML(bootstrapField)
    })
})

router.post('/login', function(req,res){
    const loginForm = createLoginForm();
    loginForm.handle(req,{
        'success': async function(form) {
            // 1. we need to check if there is a user with the provided email address
            // 2. if there is a user with that email address, check if the password matches
            const user = await User.where({
                'email': form.data.email,
                'password': getHashedPassword(form.data.password)
            }).fetch({
                require: false
            })

            if (user) {
                  // 3. if both 1 and 2 passes, then the user exists
                  //     and we use the session for the client to remember that this client has logged in as that user
                  
                  // req.session represents the session file
                  // when we do `req.session.user` we are adding a new key named `user` to the session
                  // and the session file will auto save after the response is sent back
                  req.session.user = {
                    'id': user.get('id'),
                    'username': user.get('username'),
                    'email': user.get('email')
                  }
                  req.flash('success_messages', "Login successful!");
                  res.redirect('/products');
        
            } else {
                req.flash('error_messages', "Your login credentials is invalid");
                res.redirect('/users/login');
            }
          
   
            
        },
        'error': function(form) {
            res.render('users/login', {
                'form': form
            })
        },
        'empty': function(form) {
            res.render('users/login', {
                'form': form
            })
        }
    })
})

// show the info of the current logged in user
router.get('/profile', checkIfAuthenticated,  function(req,res){
  const user = req.session.user;
  res.render('users/profile',{
    'user': user
  })
})

router.get('/logout', checkIfAuthenticated, function(req,res){
    req.session.user = null;  // save to the session file null for user (i.e no user is logged in for this session)
    req.flash('success_messages', "You have been logged out successfully!");
    res.redirect('/users/login');
})

module.exports = router;