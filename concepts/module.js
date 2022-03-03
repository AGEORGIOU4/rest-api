// Sequelize Model
const {DataTypes} = require("sequelize");
const {sequelizeFn} = require("../db/createDB");

const sequelize = sequelizeFn();

const Module = sequelize.define('Module', {
    id: {
        type: DataTypes.INTEGER,
        require: true,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING,
        require: true,
        unique: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        require: true,
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