// Sequelize Model
const {Sequelize, DataTypes} = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/library.db'
})

const {Book} = require("../concepts/book.js")
const {Student} = require("../concepts/student.js")

const Loan = sequelize.define('Loan', {
    bookID: {
        type: DataTypes.INTEGER,
        require: true,
        references: {
            model: Book,
            key: 'id'
        }
    },
    studentID: {
        type: DataTypes.INTEGER,
        require: true,
        references: {
            model: Student,
            key: 'id'
        }
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
        defaultValue: false,
    },
}, {
    tableName: 'loans', // table name
    timestamps: false // skip custom timestamp columns
});

async function init() {
    await sequelize.sync();
}

init();

exports.Loan = Loan