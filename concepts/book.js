// Sequelize Model
const {Sequelize, DataTypes} = require('sequelize');
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
        allowNull: false,
        validate: {
            min: 1900,
            max: 2022
        }
    },
    loanable: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'books', // table name
    timestamps: false // skip custom timestamp columns
});

async function init() {
    await sequelize.sync();
}

init();

exports.Book = Book;