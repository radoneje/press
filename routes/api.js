var express = require('express');
var axios = require('axios');
var router = express.Router();

/* GET users listing. */
router.get('/descr', async (req, res, next) =>{
  var r=await req.knex.select("*").from("t_descr")

  if(r.length>0)
    res.json(r[0]);
  else
    res.json({title:'',lid:"",subtitle:'',descr:"",date:new Date()});
});

router.post('/descr', async (req, res, next)=> {
  if(!req.body.id)
  {
    var r=await req.knex("t_descr").insert({},"*")
    req.body.id=r[0].id
  }
  var id=req.body.id;
  delete req.body.id;
  console.log("d",req.body )
  await req.knex("t_descr").update(req.body);//.where({id:id})
  req.body.id=id;
  res.json(req.body);
});
router.put("/smi",async (req, res, next)=> {
  var r=await req.knex("t_smi").insert({code:(Math.floor(Math.random() * 10000) + 10000 )},"*");
  res.json(r[0])
})
router.get("/smi",async (req, res, next)=> {
  var r=await req.knex.select("*").from("t_smi").where({isDeleted:false}).orderBy("title");
  res.json(r)
})
router.delete("/smi/:id",async (req, res, next)=> {

  var r=await req.knex("t_smi").update({isDeleted:true},).where({id:req.params.id});
  res.json({id:req.params.id})
})
router.post("/smi",async (req, res, next)=> {
  console.log("req.body", req.body)
  var r=await req.knex("t_smi").update({title:req.body.title}).where({id:req.body.id});
  res.json(req.body.id);
})

router.post("/checkCode",async (req, res, next)=> {
  var r=await req.knex.select("*").from("t_smi").where({id:req.body.id, code:req.body.code});
    res.json(r.length>0);
    return ;

})

router.post("/sendSms",async (req, res, next)=> {
  await req.knex("t_users").update({isDeleted:true}).where({tel:req.body.tel});
  var code=(parseInt(Math.random()*10000)+parseInt(10000))
  var r=await req.knex("t_users")
      .insert({f:req.body.f, i:req.body.i,smiid:req.body.smi.id,tel:req.body.tel, smsCode:code},"*");
  var n=req.body.tel.replace("+7","8")
  var url="http://api.iqsms.ru/messages/v2/send/?phone=Access%20code:%20"+n+"&text="+code+"&login=z1519200766955&password=713595";
  console.log(url)
  var rr= await axios.get(url);
  console.log("req compl")
  console.log(rr.data)


  res.json(r[0].id);
});
router.post("/checkSMS",async (req, res, next)=> {
  var r= await req.knex.select("*").from("t_users")
      .where({isDeleted:false, id:req.body.id, smsCode:req.body.code});
  if(r.length==0)
    res.json(false)
  else{

   r=await req.knex("t_users").update({isConfirm:true, confirmdate:(new Date())}, "*")
       .where({ id:req.body.id});
   req.session["user"]=r[0];
    res.json(r[0].id);
  }

})
function login(req, res, next){
  if(req.session['user'])
    next();
  else
    res.redirect('/login');
}
router.post("/quest",login,async (req, res, next)=> {
  var r=await req.knex("t_q").insert({text:req.body.text, userid:req.session["user"].id, date:(new Date())}, "*")
   r=await req.knex.select("*").from("v_q").where({id:r[0].id});
  req.emit("qAdd",r[0]);
  res.json(r[0]);
})
router.post("/chat",login,async (req, res, next)=> {
  var r=await req.knex("t_chat").insert({text:req.body.text, userid:req.session["user"].id, date:(new Date())}, "*")
  r=await req.knex.select("*").from("v_chat").where({id:r[0].id});
  req.emit("chatAdd",r[0]);
  res.json(r[0]);
})
router.get("/quest",login,async (req, res, next)=> {
  var r=await req.knex.select("*").from("v_q").orderBy("date");// {text:req.body.text, userid:req.session["user"].id, date:(new Date())}, "*")

  res.json(r);
})
router.get("/chat",login,async (req, res, next)=> {
  var r=await req.knex.select("*").from("v_chat").orderBy("date");// {text:req.body.text, userid:req.session["user"].id, date:(new Date())}, "*")

  res.json(r);
})

router.get("/users",login,async (req, res, next)=> {
  var r=await req.knex.select("*").from("v_users");//.orderBy(["f","i"]).where({isDeleted:false, isConfirm:true});// {text:req.body.text, userid:req.session["user"].id, date:(new Date())}, "*")
  r.forEach(u=>{
    req.clients.forEach(c=>{
      if(c.userid==u.id /*&& c.isActive==true*/)
        u.isActive = true;
    })
  })
  res.json(r);
})
function adminLogin(req, res, next){
  if(req.session['admin'])
    next();
  else
    res.redirect('/adminLogin');
}
router.delete("/chatdelete/:id",adminLogin,async (req, res, next)=> {
  var r=await req.knex("t_chat").update({isDeleted:true}, "*").where({id:req.params.id});
  req.emit("chatDelete",r[0].id);
  res.json(r[0].id)
})
router.delete("/qdelete/:id",adminLogin,async (req, res, next)=> {
  var r=await req.knex("t_q").update({isDeleted:true}, "*").where({id:req.params.id});
  req.emit("qDelete",r[0].id);
  res.json(r[0].id)
})
router.post("/qsetStatus/",adminLogin,async (req, res, next)=> {
  var r=await req.knex("t_q").update({isReady:req.body.status}, "*").where({id:req.body.id});
  req.emit("qStatus",{id:r[0].id, isReady:r[0].isReady});
  res.json(r[0].id)
})


module.exports = router;
