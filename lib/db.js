const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydb'
});

connection.connect((err) => {
  if (err) {
    console.log('Connection failed:', err);
  } else {
    console.log('Connected to the database!');
  }
});

module.exports = connection;