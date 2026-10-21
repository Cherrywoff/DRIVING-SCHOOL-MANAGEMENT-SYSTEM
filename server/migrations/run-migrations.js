const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function runMigrations() {
  console.log('Running database migrations...');
  const sqlFile = path.join(__dirname, '001_create_tables.sql');
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');

  // Remove full-line comments and clean up
  const cleanedSql = sqlContent
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

  const statements = cleanedSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute.`);

  const connection = await pool.getConnection();

  try {
    for (const statement of statements) {
      const match = statement.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([A-Za-z0-9_]+)/i);
      const tableName = match ? match[1] : 'statement';
      
      console.log(`Executing: Creating table [${tableName}]...`);
      await connection.query(statement);
      console.log(`Table [${tableName}] created successfully.`);
    }

    console.log('\nValidating created tables in driving_school_db:');
    const [tables] = await connection.query('SHOW TABLES;');
    const tableNames = tables.map(r => Object.values(r)[0]);
    console.log(`Total tables found: ${tableNames.length}`);
    tableNames.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));

    const requiredTables = [
      'UserMaster',
      'CourseMaster',
      'InstructorMaster',
      'VehicleMaster',
      'SessionMaster',
      'BookingMaster',
      'AttendanceMaster',
      'TestScheduleMaster',
      'PaymentMaster'
    ];

    const missing = requiredTables.filter(t => !tableNames.includes(t));
    if (missing.length === 0) {
      console.log('\nAll 9 required master tables verified successfully!');
    } else {
      console.error('\nMISSING TABLES:', missing);
      process.exit(1);
    }
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigrations();
