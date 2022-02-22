// Sequelize Model
const {Sequelize, DataTypes} = require("sequelize");
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/library.db'
})

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
        allowNull: false
    },
}, {
    tableName: 'students', // table name
    timestamps: false // skip custom timestamp columns
});

sequelize.sync();

exports.Student = Student;