const express = require('express')
const router = express.Router();

const {Bibliography} = require("../concepts/bibliography");

// ======== Bibliographies API Calls ======== //

router.put('/library/bibliography/:moduleCode/:bookID', (req, res) => {
        const {moduleCode} = req.params; // get moduleCode from URI
        const {bookID} = req.params; // get bookID from URI

        if (!moduleCode || !bookID) {
            res.status(409)
                .setHeader('content-type', 'application/json')
                .send({message: `Module Code and Book ID are required`});
        } else {
            Bibliography.findOne({
                where: {
                    moduleCode: moduleCode,
                    bookID: bookID
                }
            })
                .then(bibliography => {
                    if (!bibliography) { // bibliography not found
                        Bibliography.create({
                            moduleCode: moduleCode,
                            bookID: bookID,
                        })
                            .then(bibliography => {
                                res.status(200)
                                    .setHeader('content-type', 'application/json')
                                    .send({message: `Bibliography added`, bibliography: bibliography}); // body is JSON
                            })
                            .catch(error => {
                                res.status(500)
                                    .setHeader('content-type', 'application/json')
                                    .send({error: `Server error: ${error.name}`});
                            });
                    } else { // bibliography found
                        if (moduleCode)
                            bibliography.moduleCode = moduleCode;

                        if (bookID)
                            bibliography.bookID = bookID;

                        bibliography.save()
                            .then(bibliography => {
                                res.status(200)
                                    .setHeader('content-type', 'application/json')
                                    .send({message: `Bibliography updated`, bibliography: bibliography}); // body is JSON
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
        }
    });

router.get('/library/bibliography/:moduleCode', (req, res) => {
    const {moduleCode} = req.params; // extract 'id' from request

    if (!moduleCode) {
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `Module code is required`});
    } else {
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
    }
});

router.delete('/library/bibliography/:moduleCode/:bookID', (req, res) => {
    const {moduleCode} = req.params; // get moduleCode from URI
    const {bookID} = req.params; // get bookID from URI

    if (!moduleCode || !bookID) {
        res.status(409)
            .setHeader('content-type', 'application/json')
            .send({message: `Module Code and Book ID are required`});
    } else {
        Bibliography.findOne({
            where: {
                moduleCode: moduleCode,
                bookID: bookID
            }
        })
            .then(bibliography => {
                if (bibliography) {
                    bibliography.destroy()
                        .then(() => {
                            res.status(200)
                                .setHeader('content-type', 'application/json')
                                .send({ message: `Bibliography deleted for moduleCode ${moduleCode} and bookID ${bookID}`});
                        })
                        .catch(error => {
                            res.status(500)
                                .setHeader('content-type', 'application/json')
                                .send({error: `Server error: ${error.name}`});
                        });
                } else { // bibliography not found
                    res.status(404)
                        .setHeader('content-type', 'application/json')
                        .send({message: `bibliography not found for moduleCode ${moduleCode} and bookID ${bookID}`});
                }
            })
            .catch(error => {
                res.status(500)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Server error: ${error.name}`});
            });
    }
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