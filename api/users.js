const express = require('express');
const router = express.Router();
const crypto = require('crypto');


// dependencies for logging in
const jwt = require('jsonwebtoken');
const { User, BlacklistedToken } = require('../models');
const { checkIfAuthenticatedWithJWT, checkIfAuthenticated } = require('../middlewares');

// first parameter should be a plain JavaScript object that describes the user
// (not Bookshelf)
function generateToken(user, tokenSecret, expiryIn) {


    // create a JWT
    // first parameter - payload (what data we want to store)
    // second parameter - token secret
    return jwt.sign({
        'username': user.username,
        'id': user.id,
        'email': user.email
    }, tokenSecret, {
        'expiresIn': expiryIn  // how long the token is valid for
    })
}

function getHashedPassword(password) {
    const sha256 = crypto.createHash("sha256");
    const hash = sha256.update(password).digest('base64');
    return hash;
}

router.post('/login', async function (req, res) {
    const user = await User.where({
        'email': req.body.email,
        'password': getHashedPassword(req.body.password)
    }).fetch({
        require: false
    })

    if (user) {
        // access token (expirs every 15m)
        const accessToken = generateToken(user.toJSON(),
            process.env.TOKEN_SECRET,
            '15m');
        const refreshToken = generateToken(user.toJSON(),
            process.env.REFRESH_TOKEN_SECRET,
            '3h');
        res.json({
            'accessToken': accessToken,
            'refreshToken': refreshToken
        })
    } else {
        res.status(403);
        res.json({
            'error': "Your login credentials are invalid"
        })
    }
})

// get a new access token based on the refresh token
// in the body
router.post('/refresh', async function (req, res) {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.status(403);
        res.json({
            'error': 'No refresh token found'
        })
        return;
    }

    const blacklistedToken = BlacklistedToken.where({
        'token': refreshToken
    }).fetch({
        require: false
    })

    if (blacklistedToken) {
        res.status(403);
        res.json({
            'error': 'The refresh token has been invalidated'
        });
        return;
    }

    // verify that the refresh token is valid
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, function (err, payload) {
        if (err) {
            return res.sendStatus(403);
        }

        // create a new access token
        const accessToken = generateToken(payload, process.env.TOKEN_SECRET, '15m');
        res.json({
            'accessToken': accessToken
        })
    })
})

router.get('/profile', checkIfAuthenticated, function (req, res) {
    res.json({
        "profile": req.user
    })
})

// refreshToken must be in the req.body
router.post('/logout', async function (req, res) {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(403);
    }

    // check if the refresh token been already blacklisted
    const blacklistedToken = BlacklistedToken.where({
        'token': refreshToken
    }).fetch({
        require: false
    })

    if (!blacklistedToken) {
        res.status(401);
        res.json({
            'error': 'The refresh token has already been black listed'
        })
        return;
    }

    // the refresh token has not been blacklisted
    const token = new BlacklistedToken({
        'token': refreshToken
    })
    await token.save();
    res.json({
        'message': "The refresh token has been blacklisted"
    })
})

module.exports = router;