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
        }
    },
        // {
        //     indexes: [
        //         {
        //             fields: ['status']
        //         },
        //         {
        //             fields: ['priority']
        //         },
        //         {
        //             fields: ['tags'],
        //             using: 'gin',
        //             operator: 'jsonb_path_ops'
        //         }, {
        //             fields: ['performer'],
        //             using: 'gin',
        //             operator: 'jsonb_path_ops'
        //         }
        //     ]
        // }
    );

    return event;
};