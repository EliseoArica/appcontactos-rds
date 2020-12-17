const bcrypt = require('bcryptjs');

const passwordAuthentication = {};

passwordAuthentication.encryptPassword = async function(password) {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
};

passwordAuthentication.matchPassword = async function(plane, encrypted) { // Clave en texto plano / Encriptada
    const result = await bcrypt.compare(plane, encrypted);
    return result;
};

// const plane_pass = "Eliseo15963";

// const enc_pass = passwordAuthentication.encryptPassword(plane_pass);

// console.log(plane_pass, enc_pass);

module.exports = passwordAuthentication;