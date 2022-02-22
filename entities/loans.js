const express = require('express')
const router = express.Router();

// Sequelize Model
const {Sequelize, DataTypes, Op} = require('sequelize');
const error = require("express");
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/library.db'
})

const Loan = sequelize.define('Loan', {
    bookID: {
        type: DataTypes.INTEGER,
        require: true,
        primaryKey: true,
    },
    studentID: {
        type: DataTypes.INTEGER,
        require: true,
        primaryKey: true,
    },
    checkout: {
        type: DataTypes.DATE,
        allowNull: false
    },
    due: {
        type: DataTypes.DATE,
        allowNull: false
    },
    returned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
}, {
    tableName: 'loans', // table name
    timestamps: false // skip custom timestamp columns
});

sequelize.sync();

// ======== Loans API Calls ======== //
router.get('/library/loans', (req, res) => {
    Loan.findAll()
        .then(loans => {
            res.status(200)
                .setHeader('content-type', 'application/json')
                .send(loans); // body is JSON
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.post('/library/loan', (req, res) => {
    const posted_loan = req.body; // submitted loan

    if (!posted_loan || !posted_loan.bookID || !posted_loan.studentID) { // invalid loan posted
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({error: `Bad request - All fields must be completed, and code must be unique`}); // bad request
    } else {
        Loan.create({
            bookID: posted_loan.bookID,
            studentID: posted_loan.studentID,
            checkout: posted_loan.checkout,
            due: posted_loan.due,
            returned: posted_loan.returned,
        })
            .then(loan => {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Loan added`, loan: loan}); // body is JSON
            })
            .catch(error => {
                res.status(500)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Server error: ${error.name}`});
            });
    }
});

module.exports = router;