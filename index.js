const express = require('express')

const books = require('./calls/books.js');
const students = require('./calls/students.js');
const modules = require('./calls/modules.js');
const loans = require('./calls/loans.js');

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