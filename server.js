var restify = require('restify');
var gameList = require('./gamelist.js');

var server = restify.createServer({
  name: 'chessapi',
  version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

// server.get('/echo/:name', function (req, res, next) {
//   res.send(req.params);
//   return next();
// });

// server.get('/', function (req, res, next) {
//   res.send(req.params['t']);
//
//   //res.send(req.params);
//   return next();
// });

server.post('/games', function (req, res, next) {
  var params = JSON.parse(req.body);
  gameList.games(params, function(result){
    res.send(result);
  })
  return next();
});

server.listen(9090, function () {
  console.log('%s listening at %s', server.name, server.url);
});
