const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'localhost';
let sequelize;
const appConfig = require('../config');
if (env === 'production') {
    sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
        dialect: 'postgres',
        host: process.env.DB_HOSTNAME,
        port: process.env.DB_PORT,
        logging: false,
        operatorsAliases: Sequelize.Op
    });
} else if (env == 'test') {
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/test-db.sqlite',
        logging: false,
        operatorsAliases: Sequelize.Op
    });
} else {
    //local development with postgres
    sequelize = new Sequelize('stay-safe-data', 'postgres', 'admin', {
        dialect: 'postgres',
        host: 'localhost',
        port: '5432',
        operatorsAliases: Sequelize.Op
    });
}
const db = {
    event: sequelize.import(__dirname + '/models/event.js'),
    tag: sequelize.import(__dirname + '/models/tag.js'),
    sequelize: sequelize,
    Sequelize: Sequelize
};
//DB RELATIONSHIPS to be added

db.tag.belongsToMany(db.event, { as: 'tags', through: 'eventTags' });

module.exports = db;