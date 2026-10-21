const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function initDatabase() {
  console.log('Connecting to TiDB Cloud server without specific database...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '4000', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    }
  });

  console.log('Connected! Checking existing databases:');
  const [databases] = await connection.query('SHOW DATABASES;');
  console.log(databases.map(d => Object.values(d)[0]));

  console.log('Creating database driving_school_db if not exists...');
  await connection.query('CREATE DATABASE IF NOT EXISTS driving_school_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
  console.log('Database driving_school_db created/verified successfully!');

  await connection.end();
}

initDatabase().catch(err => {
  console.error('Failed to init database:', err.message);
  process.exit(1);
});
