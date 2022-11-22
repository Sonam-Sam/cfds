//jshint esversion:6

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const cookieParser = require("cookie-parser");
const app = express();
const { loginrequired, verifyEmail } = require("../config/JWT");
const {
  registerValidation,
  loginValidation,
} = require("../validator/loginValidation");
const {
  check,
  sanitizedBody,
  matchedData,
  validationResult,
} = require("express-validator");

app.use(cookieParser());
app.use(express.json());

router.get("/register", function (req, res) {
  res.render("register");
});

// mail sender details
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

router.get("/logout", function (req, res, next) {
  res.cookie("access_token", "", {
    maxAge: 1,
  });
  res.redirect("/login");
});

const createToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET
  );
};
router.get("/verify-email", function (req, res) {
  try {
    const token = req.query.token;
    const user = User.findOne({
      emailToken: token,
    });
    if (user) {
      user.updateOne(
        {
          isVerified: true,
        },
        function (err) {
          if (err) {
            res.render("login", {
              errorMessage: err,
            });
          } else {
            res.render("login", {
              successMessage:
                "Your Email has been successfully verified, Please login to continue...",
            });
          }
        }
      );
    } else {
      res.render("resgister", {
        errorMessage: "Something went wrong, Please try with different gmail!",
      });
    }
  } catch (err) {
    console.log("Verification Failed here " + err);
    res.render("login", {
      errorMessage: err,
    });
  }
});

router.post("/register", registerValidation, function (req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var errMsg = errors.mapped();
      var inputData = matchedData(req);
      res.render("register", {
        errors: errMsg,
        inputData: inputData,
      });
    } else {
      User.findOne(
        {
          email: req.body.email,
        },
        function (err, foundUser) {
          if (err) {
            res.render("resgister", {
              errorMessage: err,
            });
          } else if (foundUser) {
            res.render("resgister", {
              errorMessage:
                "This email is already used by another person. Please try with different email.",
            });
          } else {
            bcrypt.hash(req.body.password, 10, function (err, hash) {
              const user = new User({
                stdid: req.body.stdid,
                name: req.body.name,
                email: req.body.email,
                phone: req.body.number,
                password: hash,
                emailToken: crypto.randomBytes(64).toString("hex"),
                isVerified: false,
              });
              user.save(function (err) {
                if (err) {
                  console.log(err);
                } else {
                  link =
                    "http://" +
                    req.headers.host +
                    "/verify-email?token=" +
                    user.emailToken;
                  var mailOptions = {
                    from: "CFDS",
                    to: user.email,
                    subject: "CFDS- verify your email",
                    html:
                      "<h2>Hello " +
                      req.body.name +
                      ", Thanks for registering on our Website</h2><h4> Please verify your email to continue...</h4><a href=" +
                      link +
                      ">Verify your Email</a>",
                  };

                  //sending mail
                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.log("email" + error);
                    } else {
                      console.log(
                        "Verification link is sent to your gmail account"
                      );
                      res.render("register", {
                        successMessage:
                          "Verification link is sent to your gmail account",
                      });
                    }
                  });
                }
              });
            });
          }
        }
      );
    }
  } catch (err) {
    console.log("Verification Invalid" + err);
    res.render("register", {
      errorMessage: "Something went wrong, Please try again!",
    });
  }
});

module.exports = router;
