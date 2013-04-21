var express = require("express");
var crypto = require('crypto');
var xml2js = require('xml2js')
var xmlParser = new xml2js.Parser();
var _ = require('underscore')._;

var app = express();

var wx_token = 'wanggallery11';


TEMPLATE_REPLY = [
      '<xml>',
      '<ToUserName><![CDATA[<%=user%>]]></ToUserName>',
      '<FromUserName><![CDATA[<%=sp%>]]></FromUserName>',
      '<CreateTime><%=(new Date().getTime())%></CreateTime>',
      '<FuncFlag><%=flag && 1 || 0%></FuncFlag>',
      '<MsgType><![CDATA[text]]></MsgType>',
      '<Content><![CDATA[<%=content%>]]></Content>',
      '</xml>'
].join('');

calcSig = function(token, timestamp, nonce){
    var obj = {
        token: token,
        timestamp: timestamp || new Date().getTime().toString(),
        nonce: nonce || parseInt((Math.random() * 10e10), 10).toString(),
        echostr: 'echostr_' + parseInt((Math.random() * 10e10), 10).toString()
    };

    var s = [obj.token, obj.timestamp, obj.nonce].sort().join('');
    obj.signature = crypto.createHash('sha1').update(s).digest('hex');
    return obj;
};

app.get('/', function(req, res) {
    var query = req.query || {};
    var sig = query.signature;
    var dig = calcSig(wx_token, query.timestamp, query.nonce).signature;
    console.log("timestamp:%s , nonce:%s", query.timestamp, query.nonce);
    console.log("request sig:%s, dig:%s", sig, dig);
    if (dig == sig){
        if(req.method == 'GET'){
            return res.end(query.echostr)
        }else{
            return next()
        }
    }
    res.statusCode = 403;
    return res.json({ 'err': '403', 'msg': '鉴权失败,你的Token不正确'});
});

app.post('/', function(req, res){
    var query = req.query || {};
    var sig = query.signature;
    var dig = calcSig(wx_token, query.timestamp, query.nonce).signature;
    console.log("timestamp:%s , nonce:%s", query.timestamp, query.nonce);
    console.log("request sig:%s, dig:%s", sig, dig);
    var b = '';
    req.on('data', function(data){
        console.log("get body");
        b += data;
    });
    req.on('end', function(){
       console.log("body: %s", b);
       info = {};
       xmlParser.parseString(b, function (err, result) {
           console.dir(result);
           info.user = String(result.xml.FromUserName);
           info.sp = String(result.xml.ToUserName);
           info.flag = 0;
           info.content = String(result.xml.Content)
           console.log(result.xml.ToUserName);
       });
       res.write(_.template(TEMPLATE_REPLY)(info));
       res.end();
    });
});

var port = process.env.VMC_APP_PORT || 3000;
app.listen(port, function(){
    console.log("Listening on %s", port);
});



