// Sequelize Model
const {DataTypes} = require("sequelize");
const {sequelizeFn} = require("../db/createDB");

const sequelize = sequelizeFn();

const {Book} = require("../concepts/book.js")
const {Student} = require("../concepts/student.js")

const Loan = sequelize.define('Loan', {
    id: {
        type: DataTypes.INTEGER,
        require: true,
        primaryKey: true,
        autoIncrement: true
    },
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