var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', login, async(req, res, next) =>{

  var r=await req.knex.select("*").from("t_descr")
  console.log("index",r[0].title.replace("<br>",""), r[0].title)
  var title=r[0].title.replace("<br>","")
  res.render('index', { title:title, descr:r[0], user:req.session['user']});
      // res.render('login', { title: r[0].title, descr:r[0], user:req.session['user']});

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
  res.render('admin', { title: 'Admin page', user:req.session['user'] });
});
router.get('/ipad', adminLogin, function(req, res, next) {
  res.render('ipad', { title: 'Admin page', user:req.session['user'] });
});
router.get('/admin/screen', adminLogin, function(req, res, next) {
  res.render('screen', { title: 'Screen page', user:req.session['user'] });
})

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
router.post('/adminLogin', async function(req, res, next) {
  req.session['admin']=null;
  if(req.body.email=='d@rustv.ru' && req.body.pass=="123"){
    req.session['admin']=req.body.email;
    var r=await req.knex.select("*").from("t_users").where({"tel":"03"})
    console.log("user", r[0])
    req.session["user"]=r[0];
    setTimeout(()=>{  res.redirect("/admin")}, 1000)

  }
  else
    setTimeout(()=>{  res.render('adminLogin', { title: 'admin Login' });}, 1000)

});

router.get('/room', function(req, res, next) {
  res.render('room', { title: 'Express' });
});
router.get('/moderator', function(req, res, next) {
  res.render('moderator', { title: 'Express' });
});

module.exports = router;
