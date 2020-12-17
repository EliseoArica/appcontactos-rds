const usersController = {};
const { authenticate } = require('passport');
const passport = require('passport');
// const User = require('../models/User');
const db = require('../dbconnection');
const au = require('../config/encrypt');

usersController.renderSignUpForm = (req, res) => {
    res.render('users/signup'); // views/users/signup
};

usersController.signup = async(req, res) => {
    const errors = [];
    const { name, email, password, confirm_password } = req.body;
    if (password != confirm_password) {
        errors.push({ text: 'Las contraseñas no coinciden' });
    }
    if (password.length < 6) {
        errors.push({ text: "La contraseña debe contener al menos 6 caracteres" });
    }
    if (errors.length > 0) {
        res.render('users/signup', {
            errors
        });
    } else {
        // No hay errores en el envío de datos del formulario...
        let sql = "SELECT * from users where email = ?";
        var emailUser;
        db.query(sql,[email], function(err, result) {
            if (err) {
                console.log(err);
            } else {
                emailUser = result[0];
                console.log(emailUser);
            }
        });
        if (emailUser) {
            req.flash('error_msg', 'El email ya está registrado');
            res.redirect('/signup');
        } else {
            const newpass = await au.encryptPassword(password);
            let sql = "INSERT INTO users(name, email, password) values(?, ?, ?)";
            db.query(sql, [name, email, newpass], function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                    req.flash('success_msg', 'Hurra! Ya estás registrado :)');
                    res.redirect('/signin');
                }
            });
        }
    }
};

usersController.renderSignInForm = (req, res) => {
    res.render('users/signin');
};

usersController.signin = passport.authenticate('local', {
    failureRedirect: '/signin',
    successRedirect: '/contacts',
    failureFlash: true
});

usersController.logout = (req, res) => {
    req.logout();
    req.flash('success_msg', 'Se ha cerrado la sesión');
    res.redirect('/signin');
}


module.exports = usersController;