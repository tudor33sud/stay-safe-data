module.exports = function (sequelize, DataTypes) {

    const tag = sequelize.define('tag', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        gravity: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
        {
            indexes: [
                {
                    fields: ['name']
                }
            ]
        }
    );

    return tag;
};