new Vue({

    el: '#app',
    data: {
        desc:{},
        smi:[]
    },
    methods: {
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
        }
    },
    mounted: async function () {
      var re= await axios.get("/rest/api/descr");
      this.desc=re.data;
        var re= await axios.get("/rest/api/smi");
        this.smi=re.data;
    }
});