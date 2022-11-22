const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const { loginrequired, verifyEmail } = require("../config/JWT");
const {
    check,
    sanitizedBody,
    matchedData,
    validationResult,
  } = require("express-validator");
  const {
    registerValidation,
    loginValidation
  } = require("../validator/loginValidation");

router.get("/", function(req, res){
    res.render("index");
})

router.get("/login", function(req, res){
    res.render("login");
})

const createToken = (id) => {
    return jwt.sign({
      id
    }, process.env.JWT_SECRET);
  };  

router.post("/login", loginValidation, verifyEmail,
  function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var errMsg = errors.mapped();
      var inputData = matchedData(req);
      res.render("login", {
        errors: errMsg,
        inputData: inputData
      });
    } else {
      const email = req.body.email;
      const password = req.body.password;
      User.findOne({
        email: email
      }, function(err, foundUser) {
        if (err) {
          console.log(err);
          res.render("login", {
            errorMessage: err
          });
        } else if (foundUser) {
          bcrypt.compare(password, foundUser.password, function(err, result) {
            if (result === true) {
              const token = createToken(foundUser._id);
              //store token in cookies
              res.cookie("access_token", token);
              res.render("user_dashboard");
            } else {
              res.render("login", {
                errorMessage: "Your password is incorrect!"
              });
            }
          });
        } else {
          res.render("login", {
            errorMessage: "No such User found!"
          });
        }
      });
    }
  });

module.exports = router;