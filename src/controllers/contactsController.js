const contactsController = {};

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

// Create S3 service object
const s3 = new AWS.S3({
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key
});

// const Contact = require('../models/Contact');
const db = require('../dbconnection');
const fs = require('fs-extra');

contactsController.renderContactForm = (req, res) => {
    res.render('contacts/contacts_form'); // views/contacts/contacts_form
};

contactsController.createNewContact = async(req, res) => {
    const { name, surname, phone } = req.body;
    const file = req.file;

    if (file) {
        const { filename, mimetype, path } = req.file;
        fs.readFile(file.path, (err, data) => {
            if (err) throw err; // Something went wrong!
            console.log(data);
            const uploadParams = {
                Bucket: `${process.env.bucket_name}/images`,
                Key: filename, // Nombre de la imagen que se guardará en S3 (El ID generado con Date())
                Body: data, // Archivo de Imagen
                ACL: 'public-read',
                ContentType: mimetype,
                ContentDisposition: 'inline'
            };
            s3.upload(uploadParams, async(err, data) => {
                await fs.unlink(path); // Borra el archivo del servidor
                if (err) {
                    console.log(err);
                } else {
                    db.query({
                        sql: "INSERT INTO contacts(name, surname, phone, imageURL, public_id, user) values(?, ?, ?, ?, ?, ?)",
                        values: [name, surname, phone, data.Location, data.key, req.user.id]
                    }, function(err, results) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(results);
                            req.flash('success_msg', 'Registro correcto');
                            res.redirect('/contacts');
                        }
                    });
                }
            });
        });
    } else {
        // No hay imagen...
        req.flash('error_msg', 'El campo imagen es obligatorio');
        res.redirect('/contacts/add');
    }
};

contactsController.renderContacts = async(req, res) => {
    db.query("SELECT * FROM contacts WHERE user = ?", [req.user.id], function(err, results) {
        if (err) {
            console.log(err);
        } else {
            res.render('contacts/contacts', { contacts: results });
        }
    });
};

contactsController.renderEditForm = async(req, res) => {
    const { id } = req.params;
    db.query({
        sql: "SELECT * FROM contacts WHERE id = ? AND user = ?",
        values: [id, req.user.id]
    }, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            const contact = results[0];
            console.log(contact);
            res.render('contacts/edit_form', { contact });
        }
    });
};

contactsController.updateContact = async(req, res) => {
    const { id, name, surname, phone, public_id } = req.body;
    const file = req.file;

    if (file) {
        // Hay imagen en el formulario...
        const { filename, mimetype, path } = req.file;
        fs.readFile(file.path, function(err, data) {
            if (err) throw err; // Something went wrong!
            const deleteParams = {
                Bucket: process.env.bucket_name,
                Key: public_id
            };
            s3.deleteObject(deleteParams, function(err, result) {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    // Subimos una nueva imagen a S3
                    console.log(result);
                    const uploadParams = {
                        Bucket: `${process.env.bucket_name}/images`,
                        Key: filename, // Nombre de la imagen que se guardará en S3 (El ID generado con Date())
                        Body: data, // Archivo de Imagen - Lo que está devolviendo readFile()
                        ACL: 'public-read',
                        ContentType: mimetype,
                        ContentDisposition: 'inline'
                    };
                    s3.upload(uploadParams, async function(err, data) {
                        await fs.unlink(path);
                        if (err) {
                            console.log(err)
                            req.flash('error_msg', 'Ups! Algo ocurrió y no se pudo procesar tu solicitud');
                            res.redirect('/contacts');
                        } else {
                            db.query({
                                sql: "UPDATE contacts SET name = ?, surname = ?, phone = ?, imageURL = ?, public_id = ? WHERE id = ?",
                                values: [name, surname, phone, data.Location, data.key, id]
                            }, function(err, results) {
                                if (err) {
                                    console.log(err);
                                    req.flash('error_msg', 'Ups! Algo ocurrió y no se pudo procesar tu solicitud');
                                    res.redirect('/contacts');
                                } else {
                                    console.log(results);
                                    req.flash('success_msg', 'Contacto actualizado correctamente');
                                    res.redirect('/contacts');
                                }
                            });
                        }
                    });
                }
            });
        });
    } else {
        // No hay una imagen en el formulario...
        db.query({
            sql: "UPDATE contacts SET name = ?, surname = ?, phone = ? WHERE id = ?",
            values: [name, surname, phone, id]
        }, function(err, results) {
            if (err) {
                console.log(err);
                req.flash('error_msg', 'Ups! Algo ocurrió y no se pudo procesar tu solicitud');
                res.redirect('/contacts');
            } else {
                console.log(results);
                req.flash('success_msg', 'Contacto actualizado correctamente');
                res.redirect('/contacts');
            }
        });
    }
};

contactsController.deleteContact = async(req, res) => {
    const { id } = req.params;
    db.query("SELECT * from contacts where id = ?", [id], function(err, results) {
        if (err) {
            console.log(err);
        } else {
            const public_id_to_delete = results[0].public_id;
            const params = {
                Bucket: process.env.bucket_name,
                Key: public_id_to_delete
            };
            s3.deleteObject(params, async function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                    req.flash('error_msg', 'Ha ocurrido un error, vuelve a intentarlo');
                    res.redirect('/contacts');
                } else {
                    console.log(data);
                    db.query("DELETE FROM contacts WHERE id = ?", [id], function(err, results) {
                        if (err){
                            console.log(err);
                            req.flash('error_msg', 'Ha ocurrido un error al intentar borrar el contacto, vuelve a intentarlo');
                            res.redirect('/contacts');
                        } else {
                            req.flash('success_msg', 'Contacto eliminado');
                            res.redirect('/contacts');
                        }
                    });
                }
            });
        }
    });
};

module.exports = contactsController;