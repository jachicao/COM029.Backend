/* eslint-disable no-console */
const logger = require('winston');
const app = require('./app');
const port = app.get('port');

if (app.get('env') === 'production') {
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

const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
);
