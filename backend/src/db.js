const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'New_Nic',
  password: 'Jai@31',
  port: 5432,
});

module.exports = pool;
