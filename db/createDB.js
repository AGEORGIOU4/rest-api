// Sequelize Model
const {Sequelize} = require("sequelize");
const sequelizeFn = () => new Sequelize({
    dialect: 'sqlite',
    storage: 'db/library.db'
})

exports.sequelizeFn = sequelizeFn;
