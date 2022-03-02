const express = require('express')
const router = express.Router();

const {sequelizeFn} = require('../db/createDB')
const sequelize = sequelizeFn();

const {Op} = require('sequelize');
const {Student} = require("../concepts/student.js")

// ======== Students API Calls ======== //

router.post('/library/student', (req, res) => {
    const posted_student = req.body; // submitted student

    return sequelize.transaction(async (t) => {
        // invalid student posted
        if (!posted_student.name || !posted_student.yob || posted_student.yob < 1900 || posted_student.yob > 2022) {
            return res.status(422)
                .setHeader('content-type', 'application/json')
                .send({error: `Bad request - All fields must be completed, and yob must be in range of 1900-2022`}); // bad request
        }

        return Student.create({
            name: posted_student.name,
            yob: posted_student.yob,
        }, {transaction: t})
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
    });
});

router.get('/library/student/:id', (req, res) => {
    const {id} = req.params; // extract 'id' from request

    if (isNaN(id)) {
        return res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `ID is non-numeric`});
    }

    Student.findOne({where: {id: id}})
        .then(student => {
            if (!student) {
                return res.status(404)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Student not found for id: ${id}`});
            }

            // student found
            return res.status(200)
                .setHeader('content-type', 'application/json')
                .send(student); // body is JSON
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.get('/library/student', (req, res) => {
    const name = req.query.name; // extract 'name' from request

    if (!name) {
        return res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `Query is empty`});
    }

    Student.findAll({where: {name: {[Op.like]: `%${name}%`}}})
        .then(student => {
            // book found
            if (student) {
                return res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send(student); // body is JSON
            }
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.put('/library/student/:id', (req, res) => {
    const {id} = req.params; // get id from URI
    const posted_student = req.body; // submitted student

    return sequelize.transaction(async (t) => {
        if (isNaN(id)) {
            return res.status(422)
                .setHeader('content-type', 'application/json')
                .send({message: `ID is non-numeric`});
        }

        const student = await Student.findOne({where: {id: id}})

        if (!student) {
            return res.status(404)
                .setHeader('content-type', 'application/json')
                .send({message: `Student not found for id: ${id}`});
        }

        if (Object.keys(posted_student).length === 0) {
            return res.status(422)
                .setHeader('content-type', 'application/json')
                .send({error: `Bad request - Given ID must be valid and at least one or more fields must exist`}); // bad request
        }

        // student found
        if (posted_student.name)
            student.name = posted_student.name;

        if (posted_student.yob)
            student.yob = posted_student.yob;

        return student.save({transaction: t})
            .then(student => {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Student updated`, student: student}); // body is JSON
            })
    })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
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