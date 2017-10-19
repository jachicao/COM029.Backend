const Sequelize = require('sequelize');

function getValue(str, key) {
  const split = str.split(";");
  for (var i = 0; i < split.length; i++) {
    const s = split[i];
    if (s.indexOf(key) > -1) {
      return s.replace(key + "=", "");
    }
  }
  return "";
}

module.exports = function () {
  const app = this;
  const dbProperties = process.env.MYSQLCONNSTR_localdb;
  const db = getValue(dbProperties, "Database");
  const host = getValue(dbProperties, "Data Source");
  const username = getValue(dbProperties, "User Id");
  const password = getValue(dbProperties, "Password");
  const connectionString = `mysql://${username}:${password}@${host}/${db}`;
  const sequelize = new Sequelize(connectionString, {
    dialect: 'mysql',
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
