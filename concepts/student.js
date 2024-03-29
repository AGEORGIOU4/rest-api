// Sequelize Model
const {DataTypes} = require("sequelize");
const {sequelizeFn} = require("../db/createDB");

const sequelize = sequelizeFn();

const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.INTEGER,
        require: true,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    yob: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1900,
            max: 2022
        }
    },
}, {
    tableName: 'students', // table name
    timestamps: false // skip custom timestamp columns
});

async function init() {
    await sequelize.sync();
}

init();

exports.Student = Student;