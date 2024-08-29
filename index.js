const express = require('express');
const mysql = require('mysql');
const { exec } = require('child_process');
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
const port = 3000;

// MySQL connection setup (replace with your own credentials)
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'passwordd',
    database: 'test' 
});

connection.connect();

app.use(helmet());
app.use(express.json()); // Added this line to parse JSON in request body

// SQL Injection Vulnerable Endpoint
app.get('/user', (req, res) => {
    const userId = req.query.id;
    const query = `SELECT * FROM users WHERE id = ?`; // Changed query to use parameterized query
    connection.query(query, [userId], (err, results) => { // Passed userId as a parameter
        if (err) throw err;
        res.send(results);
    });
});

// Command Injection Vulnerable Endpoint
app.get('/exec', (req, res) => {
    let cmd = req.query.cmd;
    cmd = cmd.replace(/[`$();&|]+/g, ''); // Clean user input
    exec(cmd, (err, stdout, stderr) => { // Vulnerable to command injection
        if (err) {
            res.send(`Error: ${stderr}`);
            return;
        }
        res.send(`Output: ${stdout}`);
    });
});

// Insecure Random Number Generation
app.get('/random', (req, res) => {
    const randomNumber = Math.random(); // Insecure random number generation
    res.send(`Random number: ${randomNumber}`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});