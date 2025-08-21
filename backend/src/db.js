const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
<<<<<<< Updated upstream
  database: 'New_Nic',
  password: 'Jai@31',
=======
  database: 'NIC',
  password: 'new rules',
>>>>>>> Stashed changes
  port: 5432,
});

module.exports = pool;
