const express = require('express')

const books = require('./entities/books.js');
const students = require('./entities/students.js');
const modules = require('./entities/modules.js');
const loans = require('./entities/loans.js');

const app = express();
const port = 3000;

app.use(express.json());

// ===== Calls ===== //
app.use('/', books);
app.use('/', students);
app.use('/', modules);
app.use('/', loans);

app.listen(port, () => {
    console.log(`REST API app listening at http://localhost:${port}`)
});