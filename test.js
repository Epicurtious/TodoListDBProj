var mysql = require('mysql');

var con = mysql.createConnection({
  host: 'us-cdbr-east-03.cleardb.com',
  user: 'b544be9947b187',
  password: '337d07ea',
  database: "heroku_9c6c8776a0ac640",
  multipleStatements: true
});
con.query("CALL max_taskId(@output); select @output", function (err, result, fields) {
  if (err) throw err;
  console.log(result[1][0]['@output']);
})
con.end();
// con.connect(function(err) {
//   if (err) throw err;
//     con.end()
//   });
// });