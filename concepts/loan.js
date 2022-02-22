// Sequelize Model
const {Sequelize, DataTypes} = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/library.db'
})

const Loan = sequelize.define('Loan', {
    bookID: {
        type: DataTypes.INTEGER,
        require: true,
        primaryKey: true,
    },
    studentID: {
        type: DataTypes.INTEGER,
        require: true,
        primaryKey: true,
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
        defaultValue: false
    },
}, {
    tableName: 'loans', // table name
    timestamps: false // skip custom timestamp columns
});

sequelize.sync();

exports.Loan = Loan