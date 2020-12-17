const passport = require('passport');
const db = require('../dbconnection');
const au = require('../config/encrypt');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async(email, password, done) => {
    // Correo registrado?
    db.query("SELECT * FROM users WHERE email = ?", [email], async function(err, result) {
        if (err) {
            console.log(err);
        } else {
            const user = result[0];
            if (!user) {
                return done(null, false, { message: 'No se encontró al usuario' });
            } else {
                // Contraseña correcta?
                const match = await au.matchPassword(password, user.password);
                if (match) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Clave incorrecta' });
                }
            }
        }
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.query("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
        done(err, user);
    });
    // User.findById(id, (err, user) => {
    //     done(err, user);
    // });
});