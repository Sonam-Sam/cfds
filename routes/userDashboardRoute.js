const express = require('express');
const router = express.Router();
const userModel = require("../models/userModel");

router.get("/dashboard", function(req, res){
    res.render("user_dashboard");
})

module.exports = router;