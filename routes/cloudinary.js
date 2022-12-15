const express = require('express');
const router = express.Router();

// cloudinary object allows us to send requests to the
// cloudinary server
const cloudinary = require('cloudinary');
cloudinary.config({
    "api_key": process.env.CLOUDINARY_API_KEY,
    "api_secret": process.env.CLOUDINARY_API_SECRET
})

// when the cloudinary widget wants to uplaod a new file
// they will send the info about the upload to this route
router.get('/sign', async function(req,res){
    // req.query.params_to_sign will be a STRING
    // the STRING will look like JSON
    // so to convert to JSON object, we use JSON.parse
    const paramsToSign = JSON.parse(req.query.params_to_sign);

    // retrieve our API secret
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // get the signature from the cloudinary server
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    res.send(signature);
})

module.exports= router;