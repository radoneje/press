new Vue({

    el: '#app',
    data: {
        desc:{},
        smi:[],
        menu:[{id:1,title:"Модерация", a:true},{id:2,title:"СМИ", a:false}, {id:3,title:"Заголовки", a:false}],
        menuActive:1,
        qText:"",
        chatText:"",
        q:[],
        chat:[],
        users:[],
    },
    computed: {
        users: function() {
            return this.users;
        },
        q: function() {
            return this.q;
        },
        chat: function() {
            return this.chat;
        },
    },
    methods: {
        showUploadedVideo:function(item, event){

            var c=event.currentTarget;
            c.classList.add("clicked");
            setTimeout(function () {
                c.classList.remove("clicked");
            }, 2000);
            console.log("showUploadedVideo", {id:item.id, video:item.video}, )
            sendToServer(item.video,"showUploadedVideo")

        },
        startShow:function(item, event){

            var c=event.currentTarget;
            c.classList.add("clicked");
            setTimeout(function () {
                c.classList.remove("clicked");
            }, 2000);
            console.log("startBroadcast", item.id, )
            sendToServer(item.id,"startBroadcastToClient")

        },
        stopShow:function(event){
            var c=event.currentTarget;
            console.log("stopBroadcast")
            sendToServer(0,"stopBroadcastToClient")
            c.classList.add("clicked");
            setTimeout(function () {
                c.classList.remove("clicked");
            }, 2000);
        },
        changeSection:function(item){
            var _this=this;
            this.menu.forEach(function (e) {
                if(e.id==item.id){
                    _this.menuActive=e.id;
                    e.a=true
                }
                else
                    e.a=false
            })
        },
        descrChange:async function () {
            var re=await axios.post("/rest/api/descr", this.desc);
            this.desc=re.data;
        },
        addSmi:async function(){
            var re=await axios.put("/rest/api/smi");
            this.smi.push(re.data);
        },
        deleteSmi:async function(item){
            if(confirm("Вы действительно хотите удалить "+item.title))
            {
                var re=await axios.delete("/rest/api/smi/"+item.id);
                this.smi=this.smi.filter(function (e) {
                    return e.id!=item.id;
                })
            }
        },
        changeSmi: async function(item){
                var re=await axios.post("/rest/api/smi", item);
        },
        qtextChange:function (e) {
            var _this=this;
            qtextChange(_this,e)

        },
        chattextChange:function (e) {
            var _this=this;
            chattextChange(_this, e);

        },
        chatAddSmile:function () {
            this.chatText+=" :) ";
            document.getElementById("chatText").focus();
        },
        deleteChat:function (item) {
            var _this=this;
            if(confirm('Вы хотите удалть сообщение')){
                axios.delete("/rest/api/chatdelete/"+item.id)
                    .then(function (r) {

                        })

            }
        },
        deleteQ:function (item) {
            var _this=this;
            if(confirm('Вы хотите удалть сообщение')){
                axios.delete("/rest/api/qdelete/"+item.id)
                    .then(function (r) {

                    })

            }
        },
        QsetNew:function (item) {
            axios.post("/rest/api/qsetStatus/",{id:item.id, status:false})
                .then(function (r) {

                })
        },
        QsetOld:function (item) {
            axios.post("/rest/api/qsetStatus/",{id:item.id, status:true})
                .then(function (r) {

                })
        },
        showHideJpg:function(item){
            var elem= document.getElementById('jpgWr_'+item.id)
            if(elem)
            {
                elem.style.display=item.jpgShow?"none":"block";
                item.jpgShow=!item.jpgShow;
            }
        }

    },
    mounted: async function () {
      var _this=this;
      var re= await axios.get("/rest/api/descr");
      this.desc=re.data;
        var re= await axios.get("/rest/api/smi");
        this.smi=re.data;

        axios.get("/rest/api/quest")
            .then(function (r) {
                _this.q=r.data;
            })
        axios.get("/rest/api/chat")
            .then(function (r) {
                _this.chat=r.data;
            })
        axios.get("/rest/api/users")
            .then(function (r) {
                _this.users=r.data;
            })
        connect(_this, true);

    }
});