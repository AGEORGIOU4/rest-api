const express = require('express')
const router = express.Router();

const {Loan} = require("../concepts/loan.js")

const {Book} = require("../concepts/book.js")

const date = new Date();
const ninetyDaysFromToday = date.getTime() + 7776000000; // today + 90 days in milliseconds

let bookIsLoanable = 0;
let bookQuantity = 0;
let pendingLoans = 0;

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

async function getPendingLoans(bookID) {
    await Loan.count({where: {bookID: bookID}})
        .then(loans => {
            pendingLoans = loans;
        })
        .catch(error => {
            console.log({error: `Server error: ${error.name}`});
        });
}

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

router.get('/library/loans/bookID:id/:pending?', (req, res) => {
    const {id} = req.params; // extract 'id' from request
    const {pending} = req.params; // extract 'id' from request

    if (!id || isNaN(id)) {
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `ID is not valid`});
    } else if (!pending) {
        Loan.findAll({
            where: {
                bookID: id,
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
    } else {
        if (pending !== 'true' && pending !== 'false') {
            res.status(422)
                .setHeader('content-type', 'application/json')
                .send({message: `Pending is not valid (only true or false are valid)`});
        } else {
            let tmpPending = pending; // pending param gets 0 || 1 instead of true or false
            if (pending === 'false') {
                tmpPending = 0;
            } else if (pending === 'true') {
                tmpPending = 1;
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
            where: {
                studentID: id,
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

router.post('/library/loan', (req, res) => {
    const posted_loan = req.body; // submitted loan

    if (Object.keys(posted_loan).length === 0) { // check if all fields are completed
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({error: `Bad request - All fields must be completed`}); // bad request
    } else {
        getBookAttributes(posted_loan.bookID).then(() => {
                if (bookIsLoanable === 0) { // check if book exists
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
                        .send({error: `Bad request - Due date must valid (01/30/2022 23:30:30) and no more than 90 days in the future`}); // bad request
                } else if (!Date.parse(posted_loan.checkout) > 0) { // check if checkout date is valid
                    res.status(422)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Bad request - Checkout date must valid (01/30/2022 23:30:30)`}); // bad request
                } else {
                    getPendingLoans(posted_loan.bookID).then(() => {
                        if (pendingLoans >= bookQuantity) {
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
    }
});

router.put('/library/loan/:bookID&:studentID', (req, res) => {
    const {bookID} = req.params; // get code from URI
    const {studentID} = req.params; // get name from URI
    const posted_loan = req.body; // submitted loan

    if (!bookID || !studentID) {
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `Book ID and Student ID are required as parameters`});
    } else {
        Loan.findOne({
            where: {
                bookID: bookID,
                studentID: studentID
            }
        })
            .then(loan => {
                    if (!loan) {
                        res.status(404)
                            .setHeader('content-type', 'application/json')
                            .send({message: `Loan not found for book ID ${bookID} and student ID ${studentID}`});
                    } else if (!posted_loan.checkout && !posted_loan.due && !posted_loan.returned) {
                        res.status(422)
                            .setHeader('content-type', 'application/json')
                            .send({error: `Bad request - Given book ID and student ID must be valid and at least some of the Checkout, Due and Returned fields are provided`}); // bad request
                    } else { // loan found
                        if (posted_loan.checkout)
                            loan.checkout = posted_loan.checkout;
                        if (posted_loan.due)
                            loan.due = posted_loan.due;
                        if (posted_loan.returned)
                            loan.returned = posted_loan.returned;

                        loan.save()
                            .then(loan => {
                                res.status(200)
                                    .setHeader('content-type', 'application/json')
                                    .send({message: `Loan updated`, loan: loan}); // body is JSON
                            })
                            .catch(error => {
                                res.status(500)
                                    .setHeader('content-type', 'application/json')
                                    .send({error: `Server error: ${error.name}`});
                            });
                    }
                }
            )
            .catch(error => {
                res.status(500)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Server error: ${error.name}`});
            });
    }
});

router.delete('/library/loan/:bookID&:studentID', (req, res) => {
    const {bookID} = req.params; // get code from URI
    const {studentID} = req.params; // get name from URI

    Loan.findOne({
        where: {
            bookID: bookID,
            studentID: studentID
        }
    })
        .then(loan => {
            if (loan) { // loan found
                loan.destroy()
                    .then(() => {
                        res.status(200)
                            .setHeader('content-type', 'application/json')
                            .send({message: `Loan deleted: ${bookID} and ${studentID}`});
                    })
                    .catch(error => {
                        res.status(500)
                            .setHeader('content-type', 'application/json')
                            .send({error: `Server error: ${error.name}`});
                    });
            } else { // loan not found
                res.status(404)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Loan not found for id: ${bookID} and ${studentID}`});
            }
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

module.exports = router;