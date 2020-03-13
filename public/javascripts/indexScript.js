new Vue({
    el: '#app',
    data: {
        sect:[{title:"Вопросы", isActive:false, id:1}, {title:"Чат", isActive:true, id:2},{title:"Участники", isActive:false, id:3} ],
        qText:"",
        chatText:"",
        q:[],
        chat:[],
        users:[],
        activeSection:2
    },
    methods: {
        sectActive:function (item) {
            var _this=this;
            this.sect.forEach(function (e) {

                e.isActive=(item.id==e.id);
                if(e.isActive)
                    _this.activeSection=e.id
               // return e;
            })
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
        }
    },
    mounted:  function () {
        var _this=this;
        connect(_this);
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

                console.log(_this.users)
            })
    }

});



