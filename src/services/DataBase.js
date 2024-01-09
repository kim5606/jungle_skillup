var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "5606", // 비밀번호를 입력해주세요
  database: "userdb", // 데이터베이스 이름을 입력해주세요
});

module.exports = connection;
//database.js
