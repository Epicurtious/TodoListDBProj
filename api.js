var express = require("express");
var cors = require('cors');
var mysql = require('mysql');
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

const getConnection = () => {
  let con = mysql.createConnection({
    host: 'us-cdbr-east-03.cleardb.com',
    user: 'b544be9947b187',
    password: '337d07ea',
    database: "heroku_9c6c8776a0ac640",
    multipleStatements:true
  });
  return con
}

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

//get all departments
app.get('/queries/getDepartments', (req,res,next) => {
  let d = new Date();
  console.log(`Fulfilling get departments request at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)
  let con = getConnection();
  let output = {}
  con.query("SELECT * FROM department", function (err, result, fields) {
    if (err) throw err;
    result.forEach(element => {
      output[element['deptId']] = {
        "deptName": element["deptName"],
        "deptBld": element["deptBld"]
      }
    })
    res.json(output);
  })
  con.end()
});

//get all employees
app.get('/queries/getEmployees', (req,res,next) => {
  let d = new Date();
  console.log(`Fulfilling get employees request at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)
  let con = getConnection()
  let output = {};
  con.query("SELECT * FROM employees e, department d, emp_dept ed WHERE e.empId = ed.empId AND d.deptId = ed.deptId", function (err, result, fields) {
    if (err) throw err;
    result.forEach(element => {
      let name = `${element["fname"]} ${element["lname"]}`
      output[element['empId']] = {
        "name": name,
        "phone": element["phone"],
        "deptId": element["deptId"],
        "deptName": element["deptName"],
        "deptBld": element["deptBld"]
      }
    });
    res.json(output);
  })
  con.end();
});


//get all tasks (task should have the department, the employee, and the task information on it)
app.get('/queries/getTasksByUser', (req,res,next) => {
  let d = new Date();
  console.log(`Fulfilling get tasks request at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)
  let selectFrom = `SELECT * FROM dept_task dt, task t, emp_task et, employees e, department d`
  let where = `WHERE dt.taskId = t.taskId	AND et.taskId = t.taskId AND e.empId = et.empId AND d.deptId = dt.deptId`
  let con = getConnection();
  con.query(`${selectFrom} ${where};`, function (err, result, fields) {
    if (err) throw err;
    let output = {}
    result.forEach((row) => {
      output[row.taskId] = {
        taskTitle : row.taskTitle,
        deptId : row.deptId,
        status : row.taskStatus,
        createDate : row.createDate,
        dueDate : row.dueDate,
        priority : row.priority,
        description : row.description,
        assignedTo: `${row.fname} ${row.lname}`,
        deptName: row.deptName,
        empId: row.empId
      }  
    })
    res.json(output);
  })
  con.end();
});


//gets the task count of each status
app.get('/queries/getTaskCountByStatus', (req,res,next) => {
  let d = new Date();
  console.log(`Fulfilling get task count request at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)
  let con = getConnection();
  con.query(`SELECT t.taskStatus, COUNT(t.taskId) as taskCount FROM task t WHERE t.taskStatus != 'Closed' GROUP BY t.taskStatus;`, function (err,result,field) {
    if (err) throw err;
    res.json(result);
  })
  con.end();
})

//get task count of each department
app.get('/queries/getTaskCountOfDepartment', (req,res,next) => {
  let d = new Date();
  console.log(`Fulfilling get task count of department request at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)
  let con = getConnection();
  con.query(`SELECT d.deptId, d.deptName, COUNT(dt.taskId) as taskCount FROM dept_task dt, department d WHERE d.deptId = dt.deptId GROUP BY d.deptId, d.deptName;`, function (err,result,field) {
    if(err) throw err;
    res.json(result);
  })
  con.end();
})

//get task count of each user
app.get('/queries/getTaskCountOfUser', (req,res,next) => {
  let d = new Date();
  console.log(`Fulfilling get task count of user request at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)
  let con = getConnection();
  con.query(`SELECT e.empId, CONCAT(e.fname,' ',e.lname) AS name, COUNT(et.taskId) as taskCount FROM employees e, emp_task et, task t WHERE e.empId = et.empId AND et.taskId = t.taskId GROUP BY e.empId, e.fname, e.lname`, function (err,result,field) {
    if(err) throw err;
    res.json(result);
  })
  con.end();
})


//get task Id
app.get('/queries/getTaskId', (req,res) => {
  let d = new Date();
  console.log(`Fulfilling get task ID request at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)
  let taskId = null;
  let con = getConnection();
  con.query("CALL maxTaskId()", function (err, result, fields) {
    if (err) throw err;
    taskId = parseInt(result[0][0].taskId);
    taskId = (++taskId).toString();
    res.json({"taskId" : taskId})
  })
  con.end()
})

//add a task to the db
app.post('/posts/addTask', (req,res) => {
  let d = new Date();
  console.log(`Fulfilling post task request at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)
  let body = req.body;
  let sqlTask = `INSERT INTO task (taskTitle, taskId, dueDate, createDate, taskStatus, priority, description) VALUES ('${body.taskTitle}','${body.taskId}', '${body.dueDate}', '${body.createDate}', '${body.status}', '${body.priority}', '${body.description}')`
  let sqlDept = `INSERT INTO dept_task (taskId, deptId) VALUES ('${body.taskId}', '${body.deptId}')`
  let sqlEmp = `INSERT INTO emp_task (taskId, empId) VALUES ('${body.taskId}', '${body.empId}')`
  let con = getConnection()
  con.query(sqlTask, function (err, result, fields) {
    if (err) throw err;
  })
  con.query(sqlDept, function (err, result, fields) {
    if (err) throw err;
  })
  con.query(sqlEmp, function (err, result, fields) {
    if (err) throw err;
  })
  res.json({task:"accepted"});
  con.end();
});


//update a task in the DB
app.post('/posts/updateTask', (req, res) => {
  let d = new Date();
  console.log(`Fulfilling update tasks request at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`)
  let body = req.body;
  let sqlTaskUpdate = `UPDATE task SET taskTitle='${body.taskTitle}', dueDate='${body.dueDate}', createDate='${body.createDate}', taskStatus='${body.status}', priority='${body.level}', description='${body.description}' WHERE taskId='${body.taskId}'`
  let sqlEmpTaskUpdate = `UPDATE emp_task SET empId='${body.empId}' WHERE taskId='${body.taskId}'`
  let sqlDeptTaskUpdate = `UPDATE dept_task SET deptId='${body.deptId}' WHERE taskId='${body.taskId}'`
  let con = getConnection()
  con.query(sqlTaskUpdate, function (err, result, fields) {
    if (err) throw err;
  })
  con.query(sqlEmpTaskUpdate, function (err, result, fields) {
    if (err) throw err;
  })
  con.query(sqlDeptTaskUpdate, function (err, result, fields) {
    if (err) throw err;
  })
  res.json({task:"accepted"});
  con.end();
})


//maybe login?