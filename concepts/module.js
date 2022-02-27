// Sequelize Model
const {DataTypes} = require("sequelize");
const {sequelizeFn} = require("../db/createDB");

const sequelize = sequelizeFn();

const Module = sequelize.define('Module', {
    code: {
        type: DataTypes.STRING,
        require: true,
        primaryKey: true,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'modules', // table name
    timestamps: false // skip custom timestamp columns
});

async function init() {
    await sequelize.sync();
}

init();

exports.Module = Module;