const express = require("express");
const router = express.Router();
const userModel = require("../models/userModel");
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.auth_user,
    pass: process.env.auth_pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

router.get("/forgotPassword", function (req, res) {
  res.render("forgot_password");
});

router.get("/verify-email", function (req, res) {
  try {
    const token = req.query.token;
    const user = userModel.findOne({
      emailToken: token,
    });
    if (user) {
      user.updateOne(
        {
          isVerified: true,
        },
        function (err) {
          if (err) {
            res.render("login");
          } else {
            res.render("login");
          }
        }
      );
    } else {
      res.render("resgister");
    }
  } catch (err) {
    console.log("Verification Failed here " + err);
    res.render("login");
  }
});
router.get("/verify-password", function (req, res) {
  const token = req.query.token;
  const user = userModel.findOne({
    emailToken: token,
  });
  if (user) {
    res.render("resetPasswordForm");
  }
});

router.post("/forgotPassword", function (req, res) {
  const email = req.body.email;
  userModel.findOne(
    {
      email: email,
    },
    function (err, foundUser) {
      if (err) {
        console.log(err);
        res.render("login");
      } else if (foundUser) {
        link = "http://" + req.headers.host + "/verify-password?token=" + foundUser.emailToken;
          var mailOptions = {
            from: "CFDS",
            to: req.body.email,
            subject: "CFDS - Reset Password",
            html: "<h2>Hello " + foundUser.name + ",</h2><br><h4>Please click the link given below to reset forgot password.</h4><br><a href=" + link + ">Click here</a>"
          };

          //sending mail
          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              res.render("forgotPassword");
            } else {
              console.log("Verification link is sent to your gmail account");
              res.render("forgotPassword");
            }
          });
      } else {
        console.log("User Not found!");
        res.render("forgotPassword");
      }
    }
  );
});

router.post("/resetPasswordForm", [//Password validation
check("password").trim().notEmpty().withMessage("Password is required!").isLength({
  min: 8
}).withMessage("Password must be minimum 8 characters long"),
//Confirm password validation
check("confirmPassword").custom((value, {
  req
}) => {
  if (value !== req.body.confirmPassword) {
    throw new Error("Password confimation didn't match");
  }
  return true;
})], function(req, res) {
  try {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      var errMsg = errors.mapped();
      var inputData = matchedData(req);
      res.render("resetPasswordForm", {
        errors: errMsg,
        inputData: inputData
      });
    } else {
      console.log("TOKKEEEEN " + token1);
      const user = User.findOne({
        emailToken: token1
      });
      console.log("USERNAME "+ user);
      if (user) {
        bcrypt.hash(req.body.password, 10, function(err, hash){
          user.updateOne({password: hash}, function(err){
            if (err) {
              res.render("resetPasswordForm", {
                errorMessage: err
              });
            } else {
              res.render("login", {
                successMessage: "You have successfully reset your new password, Please login to continue..."
              });
            }
          });
        });
      }
    }
  } catch (err) {
    console.log("Verification Failed here " + err);
    res.render("login", {
      errorMessage: err
    });
  }
});

var token1;
router.get("/verify-password", function(req, res) {
  const token = req.query.token;
  token1 = token;
  const user = User.findOne({
    emailToken: token
  });
  if(user){
    res.render("resetPasswordForm");
  }
});

router.post("/forgotPassword", [check("email").notEmpty().withMessage("Email Address is required!").normalizeEmail().isEmail().withMessage("Email address must be valid")],
  function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var errMsg = errors.mapped();
      var inputData = matchedData(req);
      res.render("forgotPassword", {
        errors: errMsg,
        inputData: inputData
      });
    } else {
      User.findOne({
        email: req.body.email
      }, function(err, foundUser) {
        if (err) {
          console.log(err);
          res.render("forgotPassword", {
            errorMessage: err
          });
        } else if (foundUser) {
          link = "http://" + req.headers.host + "/verify-password?token=" + foundUser.emailToken;
          var mailOptions = {
            from: "Gyelpozhing Turf Booking",
            to: req.body.email,
            subject: "Gyelpozhing Turf Booking - Reset Password",
            html: "<h2>Hello " + foundUser.name + ",</h2><br><h4>Please click the link given below to reset forgot password.</h4><br><a href=" + link + ">Click here</a>"
          };

          //sending mail
          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              res.render("forgotPassword", {
                errorMessage: error + " No such User found!"
              });
            } else {
              console.log("Verification link is sent to your gmail account");
              res.render("forgotPassword", {
                successMessage: "Reset Verification link has been successfully to your register email."
              });
            }
          });
        } else {
          res.render("forgotPassword", {
            errorMessage: "No such User found!"
          });
        }
      });
    }
  });
module.exports = router;
