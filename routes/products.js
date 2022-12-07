// require in express
const express = require('express');
const router = express.Router();

router.get('/add', function(req,res){
    res.send("Add new product");
})

module.exports = router;