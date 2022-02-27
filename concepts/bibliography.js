// Sequelize Model
const {DataTypes} = require("sequelize");
const {sequelizeFn} = require("../db/createDB");

const sequelize = sequelizeFn();
const {Module} = require("../concepts/module.js")
const {Book} = require("../concepts/book.js")

const Bibliography = sequelize.define('Bibliography', {
    moduleCode: {
        type: DataTypes.STRING,
        primaryKey: true,
        require: true,
        allowNull: false,
        references: {
            model: Module,
            key: 'code'
        }
    },
    bookID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        require: true,
        allowNull: false,
        references: {
            model: Book,
            key: 'id'
        }
    }
}, {
    tableName: 'bibliographies', // table name
    timestamps: false // skip custom timestamp columns
});

async function init() {
    await sequelize.sync();
}

init();

exports.Bibliography = Bibliography