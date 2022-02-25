const express = require('express')
const router = express.Router();

const {Op} = require('sequelize');
const {Module} = require("../concepts/module.js")

// ======== Modules API Calls ======== //

router.post('/library/module', (req, res) => {
    const posted_module = req.body; // submitted module

    if (!posted_module.code || !posted_module.name) { // invalid module posted
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({error: `Bad request - All fields must be completed`}); // bad request
    } else {
        Module.create({
            code: posted_module.code,
            name: posted_module.name,
        })
            .then(module => {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Module added`, module: module}); // body is JSON
            })
            .catch(error => {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    res.status(409)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Module already exists for code: ${posted_module.code}`}); // resource already exists
                } else {
                    res.status(500)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Server error: ${error.name}`});
                }
            });
    }
});

router.get('/library/module/:code', (req, res) => {
    const {code} = req.params; // extract 'code' from request

    if (!code) {
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `Query is empty`});
    } else {
        Module.findOne({
            where: {
                code: {
                    [Op.like]: `${code}`
                }
            }
        })
            .then(module => {
                if (!module) {
                    res.status(404)
                        .setHeader('content-type', 'application/json')
                        .send({message: `Module not found for code: ${code}`});
                } else { // loan found
                    res.status(200)
                        .setHeader('content-type', 'application/json')
                        .send(module); // body is JSON
                }
            })
            .catch(error => {
                res.status(500)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Server error: ${error.name}`});
            });
    }
});

router.get('/library/module', (req, res) => {
    const name = req.query.name; // extract 'name' from request

    if (!name) {
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `Query is empty`});
    } else {
        Module.findAll({
            where: {
                name: {
                    [Op.like]: `%${name}%`
                }
            }
        })
            .then(module => {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send(module); // body is JSON
            })
            .catch(error => {
                res.status(500)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Server error: ${error.name}`});
            });
    }
});

router.put('/library/module/:code&:name', (req, res) => {
    const {code} = req.params; // get code from URI
    const {name} = req.params; // get name from URI
    const posted_module = req.body; // submitted module

    Module.findOne({
        where: {
            code: {
                [Op.like]: `${code}`
            },
            name: {
                [Op.like]: `${name}`
            }
        }
    })
        .then(module => {
            if (!module) {
                res.status(404)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Module not found for code ${code} and name ${name}`});
            } else if (!posted_module.name) {
                res.status(422)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Bad request - Given code and name must be valid and non-empty`}); // bad request
            } else { // module found
                if (posted_module.code)
                    module.code = posted_module.code;

                if (posted_module.name)
                    module.name = posted_module.name;

                module.save()
                    .then(module => {
                        res.status(200)
                            .setHeader('content-type', 'application/json')
                            .send({message: `Module updated`, module: module}); // body is JSON
                    })
                    .catch(error => {
                        res.status(500)
                            .setHeader('content-type', 'application/json')
                            .send({error: `Server error: ${error.name}`});
                    });
            }
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.get('/library/modules', (req, res) => {
    Module.findAll()
        .then(modules => {
            res.status(200)
                .setHeader('content-type', 'application/json')
                .send(modules); // body is JSON
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

module.exports = router;