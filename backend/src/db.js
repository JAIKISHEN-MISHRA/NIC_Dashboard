const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'NIC',
  password: 'new rules',
  port: 5432,
});

module.exports = pool;
