const express = require('express')
const router = express.Router();

const {sequelizeFn} = require('../db/createDB')
const sequelize = sequelizeFn();
const {Loan} = require("../concepts/loan.js")
const {Book} = require("../concepts/book.js")

const date = new Date();
const ninetyDaysFromToday = date.getTime() + 7776000000; // today + 90 days in milliseconds

let bookIsLoanable = 0;
let bookQuantity = 0;

let pendingLoans = 0;
let isLoanedBySameStudent = false;

async function getBookAttributes(id) {
    await Book.findOne({where: {id: id}})
        .then(book => {
            bookIsLoanable = book.loanable;
            bookQuantity = book.quantity;
        })
        .catch(error => {
            console.log({error: `Server error: ${error.name}`});
        });
}

async function getPendingLoans(bookID, studentID) {
    await Loan.count({where: {bookID: bookID}})
        .then(loans => {
            pendingLoans = loans;
        })
        .catch(error => {
            console.log({error: `Server error: ${error.name}`});
        });

    await Loan.count({where: {bookID: bookID, studentID: studentID, returned: false}})
        .then(loaned => {
            if (loaned > 0) {
                isLoanedBySameStudent = true;
            }
        })
        .catch(error => {
            console.log({error: `Server error: ${error.name}`});
        });
}

// ======== Loans API Calls ======== //

router.post('/library/loan', (req, res) => {
    const posted_loan = req.body; // submitted loan

    getBookAttributes(posted_loan.bookID).then(() => {
            if (!posted_loan.bookID || !posted_loan.studentID || !posted_loan.checkout || !posted_loan.due || !posted_loan.returned) { // check if all fields are completed
                res.status(422)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Bad request - All fields must be completed`}); // bad request
            } else if (bookIsLoanable === 0) { // check if book exists
                res.status(422)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Bad request - Book does not exist`}); // bad request
            } else if (!bookIsLoanable) { // check if book is loanable
                res.status(422)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Bad request - Book must be loanable`}); // bad request
                bookIsLoanable = 0;
            } else if ((Date.parse(posted_loan.due) > ninetyDaysFromToday) || (Date.parse(posted_loan.due) < date.getTime()) || !posted_loan.due
                || !Date.parse(posted_loan.due) > 0) { // check if due date is valid
                res.status(422)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Bad request - Due date must be valid (01/30/2022 23:30:30) and no more than 90 days in the future`}); // bad request
            } else if (!Date.parse(posted_loan.checkout) > 0 || Date.parse(posted_loan.checkout) >= Date.parse(posted_loan.due)) { // check if checkout date is valid
                res.status(422)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Bad request - Checkout date must be valid (01/30/2022 23:30:30) and earlier than due`}); // bad request
            } else {
                getPendingLoans(posted_loan.bookID, posted_loan.studentID).then(() => {
                    if (isLoanedBySameStudent) {
                        res.status(422)
                            .setHeader('content-type', 'application/json')
                            .send({error: `Bad request - The student has already loaned this book`}); // bad request
                        isLoanedBySameStudent = false;
                    } else if (pendingLoans >= bookQuantity) {
                        res.status(422)
                            .setHeader('content-type', 'application/json')
                            .send({error: `Bad request - No available books for loan at the moment`}); // bad request
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

                                bookIsLoanable = 0;
                            })
                            .catch(error => {
                                res.status(500)
                                    .setHeader('content-type', 'application/json')
                                    .send({error: `Server error: ${error.name}`});
                            });
                    }
                })

            }
        }
    );
});

router.get('/library/loans/bookID:id/:pending?', (req, res) => {
    const {id} = req.params; // extract 'id' from request
    const {pending} = req.params; // extract 'id' from request

    if (isNaN(id)) {
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `ID is not valid`});
    } else if (!pending) { // pending is optional
        Loan.findAll({
            where: {bookID: id}
        })
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
    } else {
        if (pending !== 'true' && pending !== 'false') {
            res.status(422)
                .setHeader('content-type', 'application/json')
                .send({message: `Pending is not valid (only true or false are valid)`});
        } else {
            let tmpPending = pending; // pending param gets 0 || 1 instead of true or false
            if (pending === 'false') {
                tmpPending = 1;
            } else if (pending === 'true') {
                tmpPending = 0;
            }
            Loan.findAll({
                where: {
                    bookID: id,
                    returned: tmpPending
                }
            })
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
        }
    }
});

router.get('/library/loans/studentID:id/:pending?', (req, res) => {
    const {id} = req.params; // extract 'id' from request
    const {pending} = req.params; // extract 'id' from request

    if (!id || isNaN(id)) {
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `ID is not valid`});
    } else if (!pending) {
        Loan.findAll({
            where: {studentID: id}
        })
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
    } else {
        if (pending !== 'true' && pending !== 'false') {
            res.status(422)
                .setHeader('content-type', 'application/json')
                .send({message: `Pending is not valid (only true or false are valid)`});
        } else {
            let tmpPending = pending; // pending param gets 0 || 1 instead of true or false
            if (pending === 'false') {
                tmpPending = 1;
            } else if (pending === 'true') {
                tmpPending = 0;
            }
            Loan.findAll({
                where: {
                    studentID: id,
                    returned: tmpPending
                }
            })
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
        }
    }
});

router.put('/library/loan/:id', async (req, res) => {
    const {id} = req.params; // get code from URI
    const posted_loan = req.body; // submitted loan

    try {
        await sequelize.transaction(async (t) => {

            return Loan.findOne({
                where: {id: id}
            })
                .then(loan => {
                        if (!loan) {
                            res.status(404)
                                .setHeader('content-type', 'application/json')
                                .send({message: `Loan not found for id ${id}`});
                        } else if (!posted_loan.checkout && !posted_loan.due && !posted_loan.returned) {
                            res.status(422)
                                .setHeader('content-type', 'application/json')
                                .send({error: `Bad request - Given book ID and student ID must be valid and at least some of the Checkout, Due and Returned fields are provided`}); // bad request
                        } else if (posted_loan.due && ((Date.parse(posted_loan.due) > ninetyDaysFromToday) || (Date.parse(posted_loan.due) < date.getTime()) || !posted_loan.due
                            || !Date.parse(posted_loan.due) > 0)) { // check if due date is valid
                            res.status(422)
                                .setHeader('content-type', 'application/json')
                                .send({error: `Bad request - Due date must be valid (01/30/2022 23:30:30) and no more than 90 days in the future`}); // bad request
                        } else if (posted_loan.checkout && (!Date.parse(posted_loan.checkout) > 0 || Date.parse(posted_loan.checkout) >= Date.parse(posted_loan.due))) { // check if checkout date is valid
                            res.status(422)
                                .setHeader('content-type', 'application/json')
                                .send({error: `Bad request - Checkout date must be valid (01/30/2022 23:30:30)`}); // bad request
                        } else { // loan found
                            if (posted_loan.checkout)
                                loan.checkout = posted_loan.checkout;

                            if (posted_loan.due)
                                loan.due = posted_loan.due;

                            if (posted_loan.returned)
                                loan.returned = posted_loan.returned;

                            return loan.save({transaction: t})
                                .then(loan => {
                                    res.status(200)
                                        .setHeader('content-type', 'application/json')
                                        .send({message: `Loan updated`, loan: loan}); // body is JSON
                                })
                                .catch(error => {
                                    console.log({error: `Server error: ${error}`});
                                    res.status(500)
                                        .setHeader('content-type', 'application/json')
                                        .send({error: `Server error: ${error.name}`});
                                });
                        }
                    }
                )
        });
        // .catch(error => {
        //     res.status(500)
        //         .setHeader('content-type', 'application/json')
        //         .send({error: `Server error: ${error.name}`});
        // });
    } catch (error) {
        console.log({error: `Server error: ${error.name}`});
    }
});

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

module.exports = router;