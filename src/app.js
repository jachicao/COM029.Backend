const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');

const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');

const sequelize = require('./sequelize');

const app = feathers();

// Load app configuration
app.configure(configuration());

if (process.env.MYSQLCONNSTR_localdb != null) {
  const getValue = (str, key) => {
    const split = str.split(';');
    for (var i = 0; i < split.length; i++) {
      const s = split[i];
      if (s.indexOf(key) > -1) {
        return s.replace(key + '=', '');
      }
    }
    return '';
  };
  const dbProperties = process.env.MYSQLCONNSTR_localdb;
  const host = getValue(dbProperties, 'Data Source');
  const splitHost = host.split(':');
  app.set('db.name', getValue(dbProperties, 'Database'));
  app.set('db.username', getValue(dbProperties, 'User Id'));
  app.set('db.password', getValue(dbProperties, 'Password'));
  app.set('db.host', splitHost[0]);
  app.set('db.port', splitHost[1]);
  app.set('db.type', 'mysql');
}

// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', feathers.static(app.get('public')));

// Set up Plugins and providers
app.configure(hooks());
app.configure(sequelize);
app.configure(rest());
app.configure(socketio());

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);
// Configure a middleware for 404s and the error handler
app.use(notFound());
app.use(handler());

app.hooks(appHooks);

module.exports = app;
