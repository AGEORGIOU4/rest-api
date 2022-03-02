const express = require('express')
const router = express.Router();

const {sequelizeFn} = require('../db/createDB')
const sequelize = sequelizeFn();

const {Op} = require('sequelize');
const {Book} = require("../concepts/book");

// ======== Books API Calls ======== //

router.post('/library/book', (req, res) => {
    const posted_book = req.body; // submitted book

    return sequelize.transaction(async (t) => {
        // invalid book posted
        if (!posted_book.authors || !posted_book.title || !posted_book.isbn || !posted_book.year || !posted_book.loanable || !posted_book.quantity || posted_book.year < 1900 || posted_book.year > 2022 || posted_book.quantity < 1) {
            return res.status(422)
                .setHeader('content-type', 'application/json')
                .send({error: `Bad request - All fields must be completed, ISBN must be unique, quantity must be 1+ and year must be in range of 1900-2022`}); // bad request
        }

        return Book.create({
            authors: posted_book.authors,
            title: posted_book.title,
            isbn: posted_book.isbn,
            year: posted_book.year,
            loanable: posted_book.loanable,
            quantity: posted_book.quantity
        }, {transaction: t})
            .then(book => {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Book added`, book: book}); // body is JSON
            })
            .catch(error => {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    return res.status(409)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Book already exists for ISBN: ${posted_book.isbn}`}); // resource already exists
                }
            });
    })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.get('/library/book/:id', (req, res) => {
    const {id} = req.params; // extract 'id' from request

    if (isNaN(id)) {
        return res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `ID is non-numeric`});
    }

    Book.findOne({where: {id: id}})
        .then(book => {
            if (!book) {
                return res.status(404)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Book not found for id: ${id}`});
            }

            // book found
            return res.status(200)
                .setHeader('content-type', 'application/json')
                .send(book); // body is JSON
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.get('/library/book', (req, res) => {
    const title = req.query.title; // extract 'title' from request

    if (!title) {
        return res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `Query is empty`});
    }

    Book.findAll({where: {title: {[Op.like]: `${title}`}}})
        .then(book => {
            // book found
            if (book) {
                return res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send(book); // body is JSON
            }
        })
        .catch(error => {
            return res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.put('/library/book/:id', (req, res) => {
    const {id} = req.params; // get id from URI
    const posted_book = req.body; // submitted book

    return sequelize.transaction(async (t) => {
        if (isNaN(id)) {
            return res.status(422)
                .setHeader('content-type', 'application/json')
                .send({message: `ID is non-numeric`});
        }

        const book = await Book.findOne({where: {id: id}})

        if (!book) {
            return res.status(404)
                .setHeader('content-type', 'application/json')
                .send({message: `Book not found for id: ${id}`});
        }

        if ((Object.keys(posted_book).length === 0) || posted_book.quantity <= book.quantity) {
            return res.status(422)
                .setHeader('content-type', 'application/json')
                .send({error: `Bad request - Given ID must be valid, at least one or more fields must exist and quantity can only be increased`}); // bad request
        }

        // book found
        if (posted_book.authors)
            book.authors = posted_book.authors;

        if (posted_book.title)
            book.title = posted_book.title;

        if (posted_book.isbn)
            book.isbn = posted_book.isbn;

        if (posted_book.year)
            book.year = posted_book.year;

        if (posted_book.loanable)
            book.loanable = posted_book.loanable;

        if (posted_book.quantity)
            book.quantity = posted_book.quantity;

        return book.save({transaction: t})
            .then(book => {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Book updated`, book: book}); // body is JSON
            })
    })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

router.get('/library/books', (req, res) => {
    Book.findAll()
        .then(books => {
            res.status(200)
                .setHeader('content-type', 'application/json')
                .send(books); // body is JSON
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

module.exports = router;