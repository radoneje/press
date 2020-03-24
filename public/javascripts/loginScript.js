function msieversion() {


    var ua = window.navigator.userAgent; //Check the userAgent property of the window.navigator object
    var msie = ua.indexOf('MSIE '); // IE 10 or older
    var trident = ua.indexOf('Trident/'); //IE 11

    var v = (msie > 0 || trident > 0);
    console.log("ie", v)
    return v
}
if(msieversion())
{
    console.log("IE find")
    document.getElementById("lBottomBox").html="IE не поддерживается. Пожалуйста, используйте браузеры Edge, Yandex, Chrome, Firefox или Safari"

}
else {
    new Vue({

        el: '#app',
        data: {
            f: "",
            fErr: false,
            i: "",
            iErr: false,
            code: "",
            codeErr: false,
            smi: {},
            smiErr: false,
            smiList: [],
            smiIsShow: false,
            smsNo: "",
            smsIsSend: false,
            smsRet: "",
            userId: null,
            showSMS: false,
            smsRetErr: false,
            loader: false,
            SMSloader: false

        },
        methods: {
            keyDown: function (e) {
                if (e.keyCode == 13)
                    sendSms();
            },
            smiShow: function () {
                this.smiIsShow = true;
                console.log(this.smiIsShow)
            },
            smiSelect: function (item) {
                this.smi = item;
            },
            enter: function () {
                var _this = this;
                if (this.f.length < 2) {
                    this.fErr = true;
                } else
                    this.fErr = false
                if (this.i.length < 2) {
                    this.iErr = true;
                } else
                    this.iErr = false

                this.codeErr = !checkCode(this.code)

                if (!this.smi.id) {
                    this.smiErr = true;
                } else
                    this.smiErr = false

                if (this.fErr || this.iErr || this.codeErr || this.smiErr) {
                    console.log(this.smi, this.fErr, this.iErr, this.codeErr, this.smiErr);
                    return;
                }

                console.log('try check code');
                _this.loader = true;
                axios.post("/rest/api/checkCode/", {code: parseInt(this.code), id: this.smi.id})
                    .then(function (res) {
                        if (!res.data) {
                            _this.code = "";
                            _this.codeErr = true;
                            document.getElementById('lCode').focus();
                            _this.loader = false;
                            return;
                        }
                        _this.loader = false;

                        setTimeout(function () {
                            _this.showSMS = true;

                        }, 100)
                        setTimeout(function () {
                            document.getElementById("smsNo").focus()
                        }, 200)

                    })
            },
            sendSms: function () {
                var _this = this;
                console.log(this.smsNo);
                if (!this.smsNo.match(/^\+\d\s\(\d\d\d\)\s\d\d\d\s\d\d\d\d$/))
                    return;
                var m = this.smsNo.match(/^\+(\d)\s\((\d\d\d)\)\s(\d\d\d)\s(\d\d\d\d)$/);
                var n = "+" + m[1] + m[2] + m[3] + m[4];
                _this.loader = true;
                _this.SMSloader = true;
                axios.post("/rest/api/sendSms", {f: this.f, i: this.i, smi: this.smi, tel: n})
                    .then(function (ret) {
                        _this.loader = false;
                        if (!ret.data) {
                            this.smsNo = "";
                            document.getElementById('smsNo').focus();
                            return;
                        }
                        console.log("sended ", n, _this.loader);
                        _this.userId = ret.data;
                        _this.smsIsSend = true;
                        _this.smsRetErr = false;
                        setTimeout(function () {
                            document.getElementById("smsRet").focus();
                        }, 500)
                    })

                console.log("send SMS to Number", n);
            },
            checkSms: function () {
                var _this = this;
                if (!checkCode(this.smsRet)) {
                    this.smsRet = "";
                    this.smsRetErr = true;
                    return;
                }
                _this.loader = true
                axios.post("/rest/api/checkSMS/", {id: this.userId, code: this.smsRet})
                    .then(function (r) {
                        if (!r.data) {
                            _this.smsRet = "";
                            _this.smsRetErr = true;
                            document.getElementById("smsRet").focus();
                            _this.loader = false;
                            return;
                        } else
                            setTimeout(function () {
                                document.location.href = "/"
                            }, 1000);
                    })
            }
        },
        mounted: function () {
            var _this = this;

            document.addEventListener("click", function () {
                _this.smiIsShow = false;
            })
            _this.smiList = s;

        }
    });
}
    function checkCode(code) {

        if (code.length < 5)
            return false;
//console.log("f check",Number.isInteger( parseInt(code)) )
        Number.isInteger(parseInt(code));


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
        this.value = matrix.replace(/./g, function (a) {
            return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a
        });
        if (event.type == "blur") {
            if (this.value.length == 2) this.value = ""
        } else setCursorPosition(this.value.length, this)
    };

    var input = document.querySelector("#smsNo");
    if (input) {
        input.addEventListener("input", mask, false);
        input.addEventListener("focus", mask, false);
        input.addEventListener("blur", mask, false);
    }








