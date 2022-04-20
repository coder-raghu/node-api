const { Sequelize, DataTypes } = require('sequelize');

const Products = (db) => db.define('products', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    qty: {
        type: DataTypes.STRING
    },
    category: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.STRING
    },
    image: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    updatedBy: {
        type: DataTypes.INTEGER,
    },
}, {
    
});

module.exports = Products;

// `sequelize.define` also returns the model
// console.log("Raghu product")
// console.log(Products === sequelize.models.Products); // true