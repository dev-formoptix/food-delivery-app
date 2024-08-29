const express = require('express');
const mysql = require('mysql');
const { spawn } = require('child_process');
const crypto = require('crypto');
const helmet = require("helmet");

const app = express();
const port = 3000;

// MySQL connection setup (replace with your own credentials)
const connection = mysql.createConnection({
  host: process.env.MYSQL_URL,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

connection.connect();

// SQL Injection Vulnerable Endpoint
app.get('/user', (req, res) => {
  const userId = req.query.id;
  const query = `SELECT * FROM users WHERE id = ?`; // Secure from SQL injection
  connection.query(query, [userId], (err, results) => {
      if (err) throw err;
      res.send(results);
  });
});

// Command Injection Vulnerable Endpoint
app.get('/exec', (req, res) => {
  const cmd = req.query.cmd;
  const commandArgs = cmd.split(' ');
  const childProcess = spawn(commandArgs[0], commandArgs.slice(1)); // Secure from command injection
  let result = '';
  
  childProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  childProcess.stderr.on('data', (data) => {
    result += data.toString();
  });

  childProcess.on('close', (code) => {
    res.send(`Output: ${result}`);
  });
});

// Insecure Random Number Generation
app.get('/random', (req, res) => {
  const array = new Uint32Array(1);
  crypto.randomFillSync(array);
  const randomNumber = array[0] / (Math.pow(2, 32)); // Secure random number generation
  res.send(`Random number: ${randomNumber}`);
});

app.disable("x-powered-by");
// Or with helmet’s hidePoweredBy middleware:
// app.use(helmet.hidePoweredBy());

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});