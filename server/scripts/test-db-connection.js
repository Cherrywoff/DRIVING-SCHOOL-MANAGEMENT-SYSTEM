const pool = require('../src/config/db');

async function testConnection() {
  console.log('Testing TiDB Cloud MySQL connection...');
  console.log(`Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT || 4000}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`SSL enabled: ${process.env.DB_SSL}`);
  
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to TiDB Cloud!');
    
    const [versionRows] = await connection.query('SELECT VERSION() AS version, CURRENT_TIMESTAMP() AS server_time');
    console.log('Server Version:', versionRows[0].version);
    console.log('Server Time:', versionRows[0].server_time);
    
    const [dbRows] = await connection.query('SELECT DATABASE() AS current_db');
    console.log('Current Active Database:', dbRows[0].current_db);
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Existing tables count:', tables.length);
    if (tables.length > 0) {
      console.log('Existing tables:');
      tables.forEach(row => console.log(' -', Object.values(row)[0]));
    } else {
      console.log('No tables found in driving_school_db. Ready for initial migration.');
    }
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Database connection FAILED:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    process.exit(1);
  }
}

testConnection();
