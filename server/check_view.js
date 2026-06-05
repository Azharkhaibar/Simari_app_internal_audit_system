const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'rims_v1'
});

connection.query('SELECT moduleType, year, quarter, COUNT(*) as count FROM risk_profile_repository_ojk_view GROUP BY moduleType, year, quarter', (err, results) => {
  if (err) {
    console.error('Error executing query:', err);
  } else {
    console.log('Results:', results);
  }
  connection.end();
});
