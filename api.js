var express = require("express");
var cors = require('cors');
var mysql = require('mysql');
var app = express();
app.use(cors());

var con = mysql.createConnection({
  host: 'us-cdbr-east-03.cleardb.com',
  user: 'b544be9947b187',
  password: '337d07ea',
  database: "heroku_9c6c8776a0ac640"
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

//get all departments
app.get('/queries/getDepartments', (req,res,next) => {
  con.query("SELECT * FROM department", function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  })
});

//get all employees
app.get('/queries/getEmployees', (req,res,next) => {
  con.query("SELECT * FROM employees", function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  })
});

//get tasks by department
app.get('/queries/getTasksByDepartment', (req,res,next) => {
  con.query("SELECT * FROM department d, dept_task dt, task t WHERE d.deptId = dt.deptId AND t.taskId = dt.taskId", function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  })
});

//get tasks by user
app.get('/queries/getTasksByUser', (req,res,next) => {
  con.query("SELECT * FROM employee e, emp_task et, task t WHERE e.empId = et.empId AND t.taskId = et.taskId", function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  })
});

//get all tasks (task should have the department, the employee, and the task information on it)
app.get('/queries/getTasksByUser', (req,res,next) => {
  con.query("SELECT * FROM department d, employee e, emp_task et, task t WHERE d.deptId = dt.deptId AND e.empId = et.empId AND t.taskId = et.taskId AND t.taskId = dt.taskId", function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  })
});

//get task count for all departments
app.get('/queries/getCountOfUser', (req,res,next) => {
  con.query("SELECT COUNT(taskId) FROM dept_task", function (err,result,field) {
    if(err) throw err;
    res.json(result);
  })
})

//get task count of department
app.get('/queries/getCountOfDepartment', (req,res,next) => {
  con.query("SELECT COUNT(dt.taskId) AS cnt FROM dept_task dt GROUP BY dt.deptId", function (err,result,field) {
    if(err) throw err;
    res.json(result);
  })
})

//get task count of user
app.get('/queries/getCountOfUser', (req,res,next) => {
  con.query("SELECT COUNT(et.taskId) AS cnt FROM emp_task et GROUP BY et.empId", function (err,result,field) {
    if(err) throw err;
    res.json(result);
  })
})

//get task count for all users
app.get('/queries/getCountOfUser', (req,res,next) => {
  con.query("SELECT COUNT(taskId) FROM emp_task", function (err,result,field) {
    if(err) throw err;
    res.json(result);
  })
})


//add a task to the db
app.post('/posts/addTask', (req,res) => {
  let body = res.body;
  let taskId = null
  let sql = "INSERT INTO task (taskId, dueDate, createDate, status, description) VALUES (" + taskId + "," + body.dueDate + "," + body.createDate + "," + body.status + "," + body.description + ")"
  con.query("CALL max_taskId(@output); select @output", function (err, result, fields) {
    if (err) throw err;
    taskId = result[1][0]['@output']
  })
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  })
});
