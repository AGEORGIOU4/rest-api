// Sequelize Model
const {Sequelize, DataTypes} = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/library.db'
})

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

sequelize.sync();

exports.Module = Module;