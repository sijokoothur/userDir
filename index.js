const mysqlCon = require('./connection.module');
const express = require('express');
const bodyParser = require('body-parser');
const passwordGenerater = require('generate-password');
const jwt = require('jsonwebtoken');
const config = require('./config');
const verifyToken = require('./auth/VerifyToken');
const app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));


let conn = mysqlCon.getConnection();
conn.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.post('/addUser',function(req,res){
    let name = req.body.name;
    let email = req.body.email;
    let mobile = req.body.mobile;

    let password = passwordGenerater.generate({
      length: 10,
      numbers: true
    });

    var sql = "INSERT INTO users (name, email,mobile,password) VALUES ('"+name+"', '"+email+"','"+mobile+"','"+password+"')";
        conn.query(sql, function (err, result) {
          if (err) throw err;
          let data = {status: "success",username: email,password: password};
          res.status(200);
          res.json(data);
        }); 
});

app.post('/getUserDetails',verifyToken,function(req,res){
  let email = req.body.email;
  
  var sql = "SELECT name,mobile,email FROM users where email = '"+email+"'";
    conn.query(sql, function (err, result) {
      if (err) throw err;
      let data = {status: "success",data: result};
      res.status(200);
      res.json(data);
    });
});

app.post('/getAllUsers',verifyToken,function(req,res){
  var sql = "SELECT name,mobile,email FROM users";
    conn.query(sql, function (err, result) {
      if (err) throw err;
      let data = {status: "success",data: result};
      res.status(200);
      res.json(data);
    });
});

app.post('/updateUserDetails',verifyToken,function(req,res){
  let email = req.body.email;
  let data = req.body.data;
  let name = data.name;
  let mobile = data.mobile;

    let sql = "SELECT count(*) as cnt FROM users where email = '"+email+"'";
    conn.query(sql, function (err, result,fields) {
      if (err) throw err;

      let rowCount = result[0].cnt;
      if(rowCount == 1){
        sql = "UPDATE users SET name = '"+name+"' , mobile = '"+mobile+"' WHERE email = '"+email+"'";
        conn.query(sql,function(err,result){
          if(err) throw err;
          let data = {status: "success"};
          res.status(200);
          res.json(data);
          
        });

      } else{
        let data = {status: "invalid user"};
        res.status(200);
        res.json(data);
      }
    });

});

app.post('/authenticateUser',function(req,res){
  let email = req.body.email;
  let password = req.body.password;

  let sql = "SELECT id FROM users where email = '"+email+"' and password = '"+password+"'";
  conn.query(sql, function (err, result,fields) {
    if (err) throw err;
    
    console.log(result.length);
    if(result.length > 0){
      
      let userId = result[0].id;
      var token = jwt.sign({ id: userId }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      res.status(200).send({ auth: true, token: token });
      
    } 
    else {
      res.status(200).send({ auth: false, token: null });
    }
  });

});

app.listen(3000);