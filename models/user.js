const { Sequelize, DataTypes } = require('sequelize');

const User = (db) => db.define('users', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING
    },
    mobile: {
        type: DataTypes.INTEGER
    },
    state: {
        type: DataTypes.STRING
    },
    remember_token: {
        type: DataTypes.STRING
    },
}, {
    
});

module.exports = User;