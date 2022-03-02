const express = require('express')
const router = express.Router();

const {sequelizeFn} = require('../db/createDB')
const sequelize = sequelizeFn();

const {Op} = require('sequelize');
const {Module} = require("../concepts/module.js")

// ======== Modules API Calls ======== //

router.post('/library/module', (req, res) => {
    const posted_module = req.body; // submitted module

    return sequelize.transaction(async (t) => {
        // invalid module posted
        if (!posted_module.code || !posted_module.name) {
            return res.status(422)
                .setHeader('content-type', 'application/json')
                .send({error: `Bad request - All fields must be completed`}); // bad request
        }

        return Module.create({
            code: posted_module.code,
            name: posted_module.name,
        }, {transaction: t})
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
                }
            });
    })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.get('/library/module/:code', (req, res) => {
    const {code} = req.params; // extract 'code' from request

    if (!code) {
        return res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `Query is empty`});
    }

    Module.findOne({where: {code: {[Op.like]: `${code}`}}})
        .then(module => {
            if (!module) {
                return res.status(404)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Module not found for code: ${code}`});
            }

            // loan found
            return res.status(200)
                .setHeader('content-type', 'application/json')
                .send(module); // body is JSON
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.get('/library/module', (req, res) => {
    const name = req.query.name; // extract 'name' from request

    if (!name) {
        return res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `Query is empty`});
    }

    Module.findAll({where: {name: {[Op.like]: `%${name}%`}}})
        .then(module => {
            return res.status(200)
                .setHeader('content-type', 'application/json')
                .send(module); // body is JSON
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.put('/library/module/:code&:name', (req, res) => {
    const {code} = req.params; // get code from URI
    const {name} = req.params; // get name from URI
    const posted_module = req.body; // submitted module

    return sequelize.transaction(async (t) => {
        const module = await Module.findOne({where: {code: {[Op.like]: `${code}`}, name: {[Op.like]: `${name}`}}})

        if (!module) {
            return res.status(404)
                .setHeader('content-type', 'application/json')
                .send({message: `Module not found for code ${code} and name ${name}`});
        }

        if (!posted_module.name) {
            return res.status(422)
                .setHeader('content-type', 'application/json')
                .send({error: `Bad request - Given code and name must be valid and non-empty`}); // bad request
        }

        // module found
        if (posted_module.code)
            module.code = posted_module.code;

        if (posted_module.name)
            module.name = posted_module.name;

        return module.save({transaction: t})
            .then(module => {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Module updated`, module: module}); // body is JSON
            })
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