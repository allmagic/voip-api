var restify = require('restify');
var socketio = require('socket.io');

// Socket Server
// Những code kiểu require(xxx) toàn trên server thôi
// Syntax là js nhưng phải chạy bằng node xxx

// gio vi du export set SOCKET_PORT trong env
var SOCKET_PORT = process.env.SOCKET_PORT || 3001; //cau nay lay env SOCKET_PORT neu khong co default la 3001
console.log('SOCKET_PORT', SOCKET_PORT);

var server = restify.createServer();
var io = socketio.listen(server.server);

var allClients = [];

function handleVoIP(req, res, next) {
  var params = req.params || {};

  console.log('params.length', Object.keys(params).length);
  console.log('params.length', params);
  if (Object.keys(params).length > 0) {
    for (client in allClients) {
      allClients[client].emit('incoming', params);
    }

    res.json(200, {"total": allClients.length});
  }

  res.json(404, {"total": 0});

  next();
}

server.use(restify.queryParser()); // Dung de parse query

server.get('/new', function(req, res, next){
  res.json(200, {"msg": "done"});
  next();
});
server.get('/incoming', handleVoIP);
server.post('/incoming', handleVoIP);

server.listen(SOCKET_PORT, function() {
  console.log('Calling API %s listening at %s', server.name, server.url);
});


server.get(/\/public\/?.*/, restify.serveStatic({
  directory: __dirname, default: 'index.html'
}));

io.sockets.on('connection', function(socket) {

  allClients.push(socket);

  socket.on('disconnect', function() {
    console.log('Got disconnect!');

    var i = allClients.indexOf(socket);
    allClients.splice(i, 1);
  });
});
