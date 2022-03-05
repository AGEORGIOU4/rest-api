const express = require('express')

const books = require('./calls/books.js');
const students = require('./calls/students.js');
const modules = require('./calls/modules.js');
const loans = require('./calls/loans.js');
const bibliographies = require('./calls/bibliographies.js');

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello REST API!")
})
app.use(express.json());

// ===== Calls ===== //
app.use('/', books);
app.use('/', students);
app.use('/', modules);
app.use('/', loans);
app.use('/', bibliographies);

app.listen(port, () => {
    console.log(`REST API app listening at http://localhost:${port}`)
});