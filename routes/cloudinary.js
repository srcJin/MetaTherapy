const express = require('express');
const router = express.Router();

// cloudinary object allows us to send requests to the cloudinary server
const cloudinary = require('cloudinary')

cloudinary.config({
    'api_key': process.env.CLOUDINARY_API_KEY,
    'api_secret': process.env.CLOUDINARY_SECRET
})

// paul: when the cloudinary widget wants to upload a new file
// it will send the info about the upload to this route

// SIGNED TRANSFER
// 1. when uploading to cloudinary by browser
// 2. the cloudinary widget pass the file name and other info to the express
// 3. then express will notify cloudinary server that we are doing an upload by providing our API SECRET and API KEY
// 4. the cloudinary server give the permission, aka signature to express
// 5. express send the signature back to the cloudinary widget
// 6. the cloudinary widget send the file + signature to cloudinary


router.get('/sign', async (req,res)=>{

    // retrieve the parameters we need to send to cloudinary
    const params_to_sign = JSON.parse(req.query.params_to_sign);

    // retrieve our cloudinary api secret from the environment
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    // get the signature (aka CSRF)
    const signature = cloudinary.utils.api_sign_request(params_to_sign, apiSecret);
    
    res.send(signature);
})

module.exports = router;
