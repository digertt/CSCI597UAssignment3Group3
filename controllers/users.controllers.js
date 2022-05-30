const User = require('../models/user');
const passport = require('passport');
const { body, validationResult } = require('express-validator');



const userLogout = (req, res, next) => {
    console.log('logout processed');
    req.session.destroy();
    req.logout();
    res.redirect('/post/about');
};

const userRegister = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // re-render register page, with the errors.
        return res.render('register', {alert: errors.array()});
    }

    const input_username = req.body.username;
    const input_email = req.body.email;
    const input_password = req.body.password;

    let userDoc, emailDoc
    console.log(input_username);
    try {
        userDoc = await User.exists({ username: input_username })
        console.log('Result :', userDoc); // false
    } catch(error) {
        console.log(error);
    }

    try {
        emailDoc = await User.exists({ email: input_email })
        console.log('Result :', emailDoc); // false
    } catch(error) {
        console.log(error);
    }
    console.log(userDoc);

    if (userDoc != false || emailDoc != false) {
        console.log('User or email exists');
        res.redirect('register');
    } else {
        console.log('Added User:', input_username, input_email);
        newUser = { email: req.body.email, username: req.body.username };
        try {
            await User.register(newUser, input_password);
            passport.authenticate('local')(req, res, function () {
                res.redirect('/post');
            });
        } catch(err) {
            console.log(err);
            res.redirect('/user/register');
        }
    }
};

module.exports = {
    userRegister,
    userLogout
};
