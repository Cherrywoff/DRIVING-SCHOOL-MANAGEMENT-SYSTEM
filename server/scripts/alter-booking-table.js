const pool = require('../src/config/db');

async function migrate() {
  try {
    console.log('Altering BookingMaster table...');
    await pool.query('ALTER TABLE BookingMaster MODIFY COLUMN InstructorID INT NULL');
    await pool.query('ALTER TABLE BookingMaster MODIFY COLUMN VehicleID INT NULL');
    await pool.query("ALTER TABLE BookingMaster MODIFY COLUMN Status ENUM('Pending','Scheduled','Completed','Cancelled','Rescheduled') DEFAULT 'Pending'");
    console.log('BookingMaster modified successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
