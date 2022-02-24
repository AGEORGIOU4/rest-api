const express = require('express')
const router = express.Router();

const {Op} = require('sequelize');
const {Student} = require("../concepts/student.js")

// ======== Students API Calls ======== //

router.post('/library/student', (req, res) => {
    const posted_student = req.body; // submitted student

    if (!posted_student.name || !posted_student.yob || posted_student.yob < 1900 || posted_student.yob > 2022) { // invalid student posted
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({error: `Bad request - All fields must be completed, and yob must be in range of 1900-2022`}); // bad request
    } else {
        Student.create({
            name: posted_student.name,
            yob: posted_student.yob,
        })
            .then(student => {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Student added`, student: student}); // body is JSON
            })
            .catch(error => {
                res.status(500)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Server error: ${error.name}`});
            });
    }
});

router.get('/library/student/:id', (req, res) => {
    const {id} = req.params; // extract 'id' from request

    if (isNaN(id)) {
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `ID is non-numeric`});
    } else {
        Student.findOne({where: {id: id}})
            .then(student => {
                if (!student) {
                    res.status(404)
                        .setHeader('content-type', 'application/json')
                        .send({message: `Student not found for id: ${id}`});
                } else { // student found
                    res.status(200)
                        .setHeader('content-type', 'application/json')
                        .send(student); // body is JSON
                }
            })
            .catch(error => {
                res.status(500)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Server error: ${error.name}`});
            });
    }
});

router.get('/library/student', (req, res) => {
    const name = req.query.name; // extract 'name' from request

    if (!name) {
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `Query is empty`});
    } else {
        Student.findAll({
            where: {
                name: {
                    [Op.like]: `%${name}%`
                }
            }
        })
            .then(student => {
                if (student) {
                    res.status(200)
                        .setHeader('content-type', 'application/json')
                        .send(student); // body is JSON
                }
            })
            .catch(error => {
                res.status(500)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Server error: ${error.name}`});
            });
    }
});

router.put('/library/student/:id', (req, res) => {
    const {id} = req.params; // get id from URI
    const posted_student = req.body; // submitted student

    if (isNaN(id)) {
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `ID is non-numeric`});
    } else {
        Student.findOne({where: {id: id}})
            .then(student => {
                if (!student) {
                    res.status(404)
                        .setHeader('content-type', 'application/json')
                        .send({message: `Student not found for id: ${id}`});
                } else if (Object.keys(posted_student).length === 0) {
                    res.status(422)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Bad request - Given ID must be valid and at least one or more fields must exist`}); // bad request
                } else { // student found
                    if (posted_student.name)
                        student.name = posted_student.name;

                    if (posted_student.yob)
                        student.yob = posted_student.yob;

                    student.save()
                        .then(student => {
                            res.status(200)
                                .setHeader('content-type', 'application/json')
                                .send({message: `Student updated`, student: student}); // body is JSON
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

router.get('/library/students', (req, res) => {
    Student.findAll()
        .then(students => {
            res.status(200)
                .setHeader('content-type', 'application/json')
                .send(students); // body is JSON
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

module.exports = router;