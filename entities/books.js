const express = require('express')
const router = express.Router();

// Sequelize Model
const {Sequelize, DataTypes, Op} = require('sequelize');
const error = require("express");
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/library.db'
})

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        require: true,
        primaryKey: true,
        autoIncrement: true
    },
    authors: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    loanable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'books', // table name
    timestamps: false // skip custom timestamp columns
});

sequelize.sync();

// ======== Books API Calls ======== //

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

router.get('/library/book/:id', (req, res) => {
    const {id} = req.params; // extract 'id' from request

    if (!id || isNaN(id)) {
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `Query is empty or ID is non-numeric`});
    } else {
        Book.findOne({where: {id: id}})
            .then(book => {
                if (!book) {
                    res.status(404)
                        .setHeader('content-type', 'application/json')
                        .send({message: `Book not found for id: ${id}`});
                } else { // book found
                    res.status(200)
                        .setHeader('content-type', 'application/json')
                        .send(book); // body is JSON
                }
            })
            .catch(error => {
                res.status(500)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Server error: ${error.name}`});
            });
    }
});

router.get('/library/book', (req, res) => {
    const title = req.query.title; // extract 'title' from request

    if (!title) {
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `Query is empty`});
    } else {
        Book.findAll({
            where: {
                title: {
                    [Op.like]: `${title}`
                }
            }
        })
            .then(book => {
                if (book) {
                    res.status(200)
                        .setHeader('content-type', 'application/json')
                        .send(book); // body is JSON
                }
            })
            .catch(error => {
                res.status(500)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Server error: ${error.name}`});
            });
    }
});

router.post('/library/book', (req, res) => {
    const posted_book = req.body; // submitted book

    if (!posted_book || !posted_book.authors || !posted_book.title || !posted_book.isbn || !posted_book.year || posted_book.year < 1900
        || posted_book.year > 2022 || !posted_book.loanable || !posted_book.quantity || posted_book.quantity < 1) { // invalid book posted
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({error: `Bad request - All fields must be completed, ISBN must be unique, quantity must be 1+ and year must be in range of 1900-2022`}); // bad request
    } else {
        Book.create({
            authors: posted_book.authors,
            title: posted_book.title,
            isbn: posted_book.isbn,
            year: posted_book.year,
            loanable: posted_book.loanable,
            quantity: posted_book.quantity
        })
            .then(book => {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Book added`, book: book}); // body is JSON
            })
            .catch(error => {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    res.status(409)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Book already exists for ISBN: ${posted_book.isbn}`}); // resource already exists
                } else {
                    res.status(500)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Server error: ${error.name}`});
                }
            });
    }
});

router.put('/library/book/:id', (req, res) => {
    const {id} = req.params; // get id from URI
    const posted_book = req.body; // submitted book

    if (!id || isNaN(id)) {
        res.status(422)
            .setHeader('content-type', 'application/json')
            .send({message: `Query is empty or ID is non-numeric`});
    } else {
        Book.findOne({where: {id: id}})
            .then(book => {
                if (!book) {
                    res.status(404)
                        .setHeader('content-type', 'application/json')
                        .send({message: `Book not found for id: ${id}`});
                } else if ((!posted_book.authors && !posted_book.title && !posted_book.isbn && !posted_book.year
                    && !posted_book.loanable && !posted_book.quantity) || posted_book.quantity < book.quantity) {
                    res.status(422)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Bad request - Given ID must be valid, at least one or more fields must exist and quantity can only be increased`}); // bad request
                } else { // book found
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

                    book.save()
                        .then(book => {
                            res.status(200)
                                .setHeader('content-type', 'application/json')
                                .send({message: `Book updated`, book: book}); // body is JSON
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

module.exports = router;