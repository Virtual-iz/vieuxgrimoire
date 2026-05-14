const http = require('http'); /*import du package natif de Node pour créer le serveur et gérer les erreurs système*/
const app = require('./app');

const normalizePort = val => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {return val;}
  if (port >= 0) {return port;}
  return false;
};

const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/*methode create server du http qui prend en argument la fonction qui sera appelée à chaque requête recue*/
const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

/*methode listen pour écouter les requête sur le port choisi*/
server.listen(port);