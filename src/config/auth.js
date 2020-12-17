const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Ups! Inicia sesión primero');
    res.redirect('/signin');
}

module.exports = helpers;