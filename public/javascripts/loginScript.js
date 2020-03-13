new Vue({

    el: '#app',
    data: {
        f:"",
        fErr:false,
        i:"",
        iErr:false,
        code:"",
        codeErr:false,
        smi:{},
        smiErr:false,
        smiList:[],
        smiIsShow:false,
        smsNo:"",
        smsIsSend:false,
        smsRet:"",
        userId:null,
        showSMS:false,
        smsRetErr:false

    },
    methods: {
        smiShow:function () {
            this.smiIsShow=true;
            console.log(this.smiIsShow)
        },
        smiSelect:function (item) {
            this.smi=item;
        },
        enter:function () {
            var _this=this;
           if(this.f.length<2)
           {this.fErr=true;}
            if(this.i.length<2)
            {this.iErr=true;}

                this.codeErr=!checkCode(this.code)

            if(!this.smi.id)
            {this.smiErr=true;}

            if(this.fErr || this.iErr || this.codeErr || this.smiErr)
            { console.log(this.smi, this.fErr , this.iErr , this.codeErr , this.smiErr);  return;}

            console.log('try check code');
            axios.post("/rest/api/checkCode/",{code:parseInt(this.code), id:this.smi.id})
                .then(function (res) {
                    if(!res.data)
                    {_this.code=""; _this.codeErr=true; document.getElementById('lCode').focus(); return; }
                    _this.showSMS=true;
                })
        },
        sendSms:function () {
            var _this=this;
            if (!this.smsNo.match(/^\+\d\s\(\d\d\d\)\s\d\d\d\s\d\d\d\d$/))
                return;
            var m = this.smsNo.match(/^\+(\d)\s\((\d\d\d)\)\s(\d\d\d)\s(\d\d\d\d)$/);
            var n="+"+m[1]+m[2]+m[3]+m[4];
            axios.post("/rest/api/sendSms",{f:this.f, i:this.i, smi:this.smi, tel:n})
                .then(function (ret) {
                    if(!ret.data)
                    { this.smsNo=""; document.getElementById('smsNo').focus();return; }
                    console.log("sended ", n);
                    _this.userId=ret.data;
                     _this.smsIsSend=true;
                    _this.smsRetErr=false;
                })

            console.log("send SMS to Number", n);
        },
        checkSms:function () {
            var _this=this;
            if(!checkCode(this.smsRet))
            {
                this.smsRet="";
                this.smsRetErr=true;
                return;
            }
            axios.post("/rest/api/checkSMS/",{id:this.userId, code:this.smsRet})
            .then(function (r) {
                if(!r.data)
                {
                    _this.smsRet="";
                    _this.smsRetErr=true;
                    document.getElementById("smsRet").focus();
                    return;
                }
                else
                    document.location.href="/";
            })
        }
    },
    mounted: async function () {
        var _this=this;
        document.addEventListener("click", function () {
            _this.smiIsShow=false;
        })
        _this.smiList=s;
    }
});
function checkCode(code) {

    if(code.length<5)
        return false;
console.log("f check",Number.isInteger( parseInt(code)) )
    return  Number.isInteger( parseInt(code));

}
function setCursorPosition(pos, elem) {
    elem.focus();
    if (elem.setSelectionRange) elem.setSelectionRange(pos, pos);
else if (elem.createTextRange) {
        var range = elem.createTextRange();
        range.collapse(true);
        range.moveEnd("character", pos);
        range.moveStart("character", pos);
        range.select()
    }
}

function mask(event) {
    var matrix = "+7 (___) ___ ____",
    i = 0,
    def = matrix.replace(/\D/g, ""),
    val = this.value.replace(/\D/g, "");
    if (def.length >= val.length) val = def;
    this.value = matrix.replace(/./g, function(a) {
        return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a
    });
    if (event.type == "blur") {
        if (this.value.length == 2) this.value = ""
    } else setCursorPosition(this.value.length, this)
};

var input = document.querySelector("#smsNo");
input.addEventListener("input", mask, false);
input.addEventListener("focus", mask, false);
input.addEventListener("blur", mask, false);



