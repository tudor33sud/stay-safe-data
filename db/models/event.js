const jwtHelper = require('../../utils/jwt-helper');
module.exports = function (sequelize, DataTypes) {

    const event = sequelize.define('event', {
        type: {
            type: DataTypes.STRING,
            defaultValue: 'emergency',
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'requested'
        },
        statusReason: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Job requested'
        },
        priority: {
            type: DataTypes.STRING,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        performerType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        performer: {
            type: DataTypes.JSONB
        },
        requester: {
            type: DataTypes.JSONB,
            allowNull: false
        },
        location: {
            type: DataTypes.JSONB,
            allowNull: false
        },
        position: {
            type: DataTypes.GEOMETRY('POINT', 4326),
            allowNull: false
        },
        attachments: {
            type: DataTypes.JSONB,
            defaultValue: []
        }
    },
        {
            indexes: [
                {
                    fields: ['status']
                },
                {
                    fields: ['priority']
                },
                {
                    fields: ['performer'],
                    using: 'gin',
                    operator: 'jsonb_path_ops'
                }
            ]
        }
    );

    event.getRequester = req => {
        const userId = req.referrer.id;
        const userJWT = req.referrer.jwt;
        const decoded = jwtHelper.decode(userJWT);

        return {
            reference: `/users/${userId}`,
            identifier: userId,
            display: decoded.email ? decoded.email : userId
        };
    }

    return event;
};