module.exports = function (sequelize, DataTypes) {

    const tag = sequelize.define('tag', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
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