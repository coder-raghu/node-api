const { Sequelize, DataTypes } = require('sequelize');

const Messages = (db) => db.define('messages', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('text', 'file'),
        defaultValue: 'text',
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_read: {
        type: DataTypes.INTEGER,
        defaultValue:0,
    },
    image: {
        type: DataTypes.STRING
    },
}, {
    
});

module.exports = Messages;
