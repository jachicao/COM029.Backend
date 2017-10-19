const Sequelize = require('sequelize');

module.exports = function () {
  const app = this;
  const sequelize = new Sequelize(app.get('db.name'), app.get('db.username'), app.get('db.password'), {
    host: app.get('db.host'),
    port: app.get('db.port'),
    dialect: app.get('db.type'),
    logging: false,
    define: {
      freezeTableName: true
    }
  });
  const oldSetup = app.setup;

  app.set('sequelizeClient', sequelize);

  app.setup = function (...args) {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const models = sequelize.models;
    Object.keys(models).forEach(name => {
      if ('associate' in models[name]) {
        models[name].associate(models);
      }
    });

    // Sync to the database
    sequelize.sync();

    return result;
  };
};
