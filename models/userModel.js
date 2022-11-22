const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    stdid: String,
    name: String,
    phone: String,
    password: String,
    email: String,
    emailToken: {
        type: String,
    },
    isVerified: {
        type: Boolean,
    },
    date: {
        type: Date,
        default: Date.now()
    }
});


module.exports = new mongoose.model("User", userSchema);
