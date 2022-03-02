const express = require('express')
const router = express.Router();

const {sequelizeFn} = require('../db/createDB')
const sequelize = sequelizeFn();

const {Bibliography} = require("../concepts/bibliography");

// ======== Bibliographies API Calls ======== //

router.put('/library/bibliography/:moduleCode/:bookID', (req, res) => {
    const {moduleCode} = req.params; // get moduleCode from URI
    const {bookID} = req.params; // get bookID from URI

    return sequelize.transaction(async (t) => {
        const bibliography = await Bibliography.findOne({where: {moduleCode: moduleCode, bookID: bookID}})

        if (!bibliography) { // bibliography not found (create new)
            return Bibliography.create({
                moduleCode: moduleCode,
                bookID: bookID,
            }, {transaction: t})
                .then(bibliography => {
                    res.status(200)
                        .setHeader('content-type', 'application/json')
                        .send({message: `Bibliography added`, bibliography: bibliography}); // body is JSON
                })
        }

        // bibliography found
        if (moduleCode)
            bibliography.moduleCode = moduleCode;

        if (bookID)
            bibliography.bookID = bookID;

        return bibliography.save({transaction: t})
            .then(bibliography => {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Bibliography updated`, bibliography: bibliography}); // body is JSON
            })
    })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.get('/library/bibliography/:moduleCode', (req, res) => {
    const {moduleCode} = req.params; // extract 'id' from request

    if (!moduleCode) {
        return res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `Module code is required`});
    }

    Bibliography.findAll({where: {moduleCode: moduleCode}})
        .then(bibliography => {
            if (bibliography.length === 0) {
                res.status(404)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Bibliography not found for moduleCode: ${moduleCode}`});
            } else { // bibliography found
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send(bibliography); // body is JSON
            }
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.delete('/library/bibliography/:moduleCode/:bookID', (req, res) => {
    const {moduleCode} = req.params; // get moduleCode from URI
    const {bookID} = req.params; // get bookID from URI

    return sequelize.transaction(async (t) => {
        const bibliography = await Bibliography.findOne({where: {moduleCode: moduleCode, bookID: bookID}})

        if (!bibliography) {
            return res.status(404)
                .setHeader('content-type', 'application/json')
                .send({message: `bibliography not found for moduleCode ${moduleCode} and bookID ${bookID}`});
        }

        // bibliography found
        return bibliography.destroy({transaction: t})
            .then(bibliography => {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Bibliography deleted`, bibliography: bibliography});
            })
    })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.get('/library/bibliographies', (req, res) => {
    Bibliography.findAll()
        .then(bibliographies => {
            res.status(200)
                .setHeader('content-type', 'application/json')
                .send(bibliographies); // body is JSON
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

module.exports = router;