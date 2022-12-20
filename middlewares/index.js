const jwt = require('jsonwebtoken');

const checkIfAuthenticated = function (req, res, next) {
    // we can always access the session with `req.session`
    if (req.session.user) {
        next();
    } else {
        req.flash('error_messages', 'Sorry you are not authorized to view this page');
        res.redirect('/users/login');
    }
}



const checkIfAuthenticatedWithJWT = function (req, res, next) {
    // expected format:
    // `Bearer <jwt token>`
    const authHeader = req.headers.authorization;
    if (authHeader) {
        // 1. extract the user's jwt
        const chunks = authHeader.split(" ");
        const token = chunks[1];
        // 2. display the user info
        // jwt.verify will make sure that the token itself
        // is generated from process.env.TOKEN_SECRET and has not
        // been tampered with
        jwt.verify(token, process.env.TOKEN_SECRET, function (err, payload) {
            if (err) {
                res.sendStatus(401);
            } else {
                // save the user into the request
                // so other routes can access
                req.user = payload;
                next();
            }
        })
    }
}

module.exports = { checkIfAuthenticated, checkIfAuthenticatedWithJWT };
