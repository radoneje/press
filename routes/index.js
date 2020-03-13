var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', login, async(req, res, next) =>{


  res.render('index', { title: 'Express'});
});

function login(req, res, next){
  if(req.session['user'])
    next();
  else
    res.redirect('/login');
}
router.get('/login', async (req, res, next)=> {
  req.session["user"]=null;
  var r=await req.knex.select("*").from("t_descr")
  var s=await req.knex.select("*").from("t_smi").where({isDeleted:false}).orderBy("title")
  res.render('login', { title: 'Log in' , descr:r[0] , smi:s });
});

router.get('/admin', adminLogin, function(req, res, next) {
  res.render('admin', { title: 'Admin page' });
});

function adminLogin(req, res, next){
  if(req.session['admin'])
    next();
  else
    res.redirect('/adminLogin');
}

router.get('/adminLogin', function(req, res, next) {
  req.session['admin']=null;
  res.render('adminLogin', { title: 'admin Login' });
});
router.post('/adminLogin', function(req, res, next) {
  req.session['admin']=null;
  if(req.body.email=='d@rustv.ru' && req.body.pass=="123"){
    req.session['admin']=req.body.email;
    res.redirect("/admin")
  }
  else
    res.render('adminLogin', { title: 'admin Login' });
});

router.get('/room', function(req, res, next) {
  res.render('room', { title: 'Express' });
});
router.get('/moderator', function(req, res, next) {
  res.render('moderator', { title: 'Express' });
});

module.exports = router;
