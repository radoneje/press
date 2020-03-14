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
const emit=(event, data)=>{console.log("emit ", event,clients.length ); clients.forEach(cl=>{
  console.log("client ", cl.is, cl.isActive)
  if(cl.isActive) cl.socket.emit(event,data)
})};

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

      socket.on("hello",(data)=>{
        clients.push({id:id,isActive:true, socket:socket, userid:data.id, isAdmin:data.m})
        clientId++;
        emit("userConnnect", data.id)
      })
    socket.on("isScreen",(data)=> {
      console.log("isScreen", data)
      clients.forEach(cl => {
        if (cl.id == id) {
          cl.isScreen = false;
          cl.isActive=true;
          console.log("isScreen ok", data)
        }
      })
    });

      socket.on("disconnect",(user)=>{
        console.log("client disconnected")
        clients.forEach(cl=>{
          if(cl.id==id)
            cl.isActive=false;
          emit("userDisconnnect",cl.userid)
        })

      })

    socket.on("videoSnapshot",(data)=> {
      clients.forEach(c=>{
        if(c.isActive && c.isAdmin) {
          c.socket.emit("videoSnapshot", data);
          if(!c.videoTimeout){
            clients.forEach(cl=>{if(cl.isActive && cl.isAdmin) cl.socket.emit("startVideo",data.id)});
          }
          if(c.videoTimeout)
            clearTimeout(c.videoTimeout);
          c.videoTimeout=setTimeout(function () {
            clients.forEach(cl=>{if(cl.isActive && cl.isAdmin) cl.socket.emit("stopVideo",{id:data.id})});
          }, 5000)
        }

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

    socket.on("startBroadcastToClient",(data)=> {
      console.log("startBroadcastToClient")
      clients.forEach(cl => {
        if (cl.isActive ) {
        cl.socket.emit("startBroadcastToClient", data)
        }
      });


    })
    socket.on("stopBroadcastToClient",(data)=> {
      console.log("stopBroadcastToClient")
      clients.forEach(cl => {
        if (cl.isActive ) {
          cl.socket.emit("stopBroadcastToClient", data)
        }
      });
    })

    socket.on("startVideoChat",(data)=>{
      console.log("startVideoChat",)
      clients.forEach(cl=>{
        if(cl.isActive && cl.userid==data.userid)
          cl.socket.emit("startVideoChat",{id:id, userid:cl.userId, desc:data.desc}
          )});
    });
    socket.on("stopVideoChat",(data)=>{
      console.log("stopVideoChat",)
      clients.forEach(cl=>{
        if(cl.isActive )
          cl.socket.emit("stopVideoChat",{id:id, userid:cl.userId}
          )});
    });

    socket.on("videoOffer",(data)=>{
      console.log("videoOffer")
      clients.forEach(cl=>{
        if(cl.id==data.id && cl.isActive==true) {
          cl.socket.emit("videoOffer", {desc: data.desc, id: id, userid: cl.userId})
        }
        });
    });
    socket.on("videoAnswer",(data)=>{
      console.log("videoAnswer");
      clients.forEach(cl=>{
        if(cl.id==data.clientid && cl.isActive==true) {
          cl.socket.emit("videoAnswer", {answ: data.answ, id: id})
        }
      });
    });
    socket.on("icecandidate",(data)=>{
      clients.forEach(cl=>{
        if(cl.id==data.clientid && cl.isActive==true) {
          cl.socket.emit("icecandidate", {candidate: data.candidate, id: id})
        }
      });
    });
    socket.on("icecandidate2",(data)=>{
      console.log("icecandidate2", data.clientid);
      clients.forEach(cl=>{
        if(cl.id==data.clientid && cl.isActive==true) {
          cl.socket.emit("icecandidate2", {candidate: data.candidate, id: id})
        }
      });
    });
///////////

    })

})
