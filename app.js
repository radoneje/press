var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
var http = require('http');
const config=require('./config')
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var clients=[];
const emit=(event, data)=>{clients.forEach(cl=>{if(cl.isActive) cl.socket.emit(event,data)})};

var knex = require('knex')({
  client: 'pg',
  version: '7.2',
  connection:config.pgConnection
});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

const pgSession = require('connect-pg-simple')(session);
const pgStoreConfig = {conObject: config.pgConnection}
app.use(session({
  secret: (config.sha256Secret),
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 days
  store:new pgSession(pgStoreConfig),
}));


app.use("/", (req,res, next)=>{req.knex=knex;next();});
app.use("/", (req,res, next)=>{req.clients=clients;next();});

app.use("/", (req,res, next)=>{
  req.emit=emit;
  next();}
  );


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/rest/api/', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var server = http.createServer(app);

server.listen(config.port,e=>{
  console.log("server listen "+ config.port);
  var clientId=0;

  const io = require('socket.io')(server);
  io.on('connection', (socket) => {
        console.log("client connected", clients.length );
        var id=clientId;

      socket.on("hello",(userId)=>{
        clients.push({id:id,isActive:true, socket:socket, userid:userId})
        clientId++;
        emit("userConnnect",userId)
      })
      socket.on("disconnect",(user)=>{
        console.log("client disconnected")
        clients.forEach(cl=>{
          if(cl.id==id)
            cl.isActive=false;
          emit("userDisconnnect",cl.userid)
        })

      })
    socket.on("roomVideoMessage",(data)=>{
      console.log("roomVideoMessage", data.type, id)
      clients.filter(e=>e.isActive==true).forEach(e=>{
        console.log("emit")
        data.id=id;
        e.socket.emit("roomVideoMessage", data)
      })
    })
    })

})
