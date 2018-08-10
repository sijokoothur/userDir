let mysql = require('mysql');

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "mydb"
  });

let getConnection = function(){
    return con;
}

module.exports = {
    getConnection,mysql
}