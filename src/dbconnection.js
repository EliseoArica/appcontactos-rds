var mysql = require('mysql');
var conn = mysql.createConnection({
    host: "appcontactos.csjtsocoep14.us-east-1.rds.amazonaws.com", //process.env.DB_HOST,
    user: "earica", //process.env.DB_USER,
    password: "Tecsup123", //process.env.DB_PASSWORD,
    database: "appcontactos", //process.env.DB_NAME
});

conn.connect(function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Database connected");
    }
});

module.exports = conn;