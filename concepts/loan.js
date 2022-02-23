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
        primaryKey: true,
        references: {
            model: Book,
            key: 'id'
        }
    },
    studentID: {
        type: DataTypes.INTEGER,
        require: true,
        primaryKey: true,
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
        primaryKey: true,
    },
}, {
    tableName: 'loans', // table name
    timestamps: false // skip custom timestamp columns
});

sequelize.sync();

exports.Loan = Loan