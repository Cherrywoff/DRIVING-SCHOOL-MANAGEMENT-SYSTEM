const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function cleanAndResetData() {
  console.log('=== Cleaning and Resetting Database for Live Demonstration ===');
  const connection = await pool.getConnection();

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Clean all tables
    console.log('Truncating all tables...');
    const tables = [
      'AttendanceMaster',
      'TestScheduleMaster',
      'PaymentMaster',
      'BookingMaster',
      'InstructorMaster',
      'VehicleMaster',
      'SessionMaster',
      'CourseMaster',
      'UserMaster'
    ];

    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
      console.log(`  ✓ Cleared ${table}`);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Insert Standard Courses
    console.log('\nCreating Courses...');
    const courses = [
      {
        code: 'COURSE-MCWG',
        name: 'Two-Wheeler Complete Driving Program (MCWG)',
        category: 'Two-Wheeler (MCWG)',
        desc: 'Comprehensive training for gear and non-gear two-wheelers including balance control, traffic signals, road etiquettes, and slalom cone navigation.',
        days: 15,
        theory: 10,
        prac: 15,
        fee: 3500.00
      },
      {
        code: 'COURSE-LMV-MANUAL',
        name: 'Four-Wheeler Comprehensive Driving (LMV-Manual)',
        category: 'Four-Wheeler (LMV-Manual)',
        desc: 'Complete light motor vehicle manual driving course covering clutch friction point, gear transmission, parallel parking, reversing, and city traffic navigation.',
        days: 30,
        theory: 15,
        prac: 25,
        fee: 6500.00
      },
      {
        code: 'COURSE-LMV-AUTO',
        name: 'Four-Wheeler Premium Automatic (LMV-Auto)',
        category: 'Four-Wheeler (LMV-Auto)',
        desc: 'Modern driver training for automatic transmission vehicles covering smooth acceleration, cruise safety, hill hold assist, and emergency braking techniques.',
        days: 25,
        theory: 12,
        prac: 20,
        fee: 7500.00
      },
      {
        code: 'COURSE-COMBO',
        name: 'Dual Combo Driver License Package (MCWG + LMV-Manual)',
        category: 'Four-Wheeler (LMV-Manual)',
        desc: 'All-in-one comprehensive training program for two-wheelers and four-wheelers. Includes extensive RTO mock exam drills and licensing test assistance.',
        days: 40,
        theory: 20,
        prac: 35,
        fee: 9000.00
      }
    ];

    for (const c of courses) {
      await connection.query(
        `INSERT INTO CourseMaster (CourseCode, CourseName, Category, Description, DurationDays, TheoryHours, PracticalHours, Fee, Status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
        [c.code, c.name, c.category, c.desc, c.days, c.theory, c.prac, c.fee]
      );
    }
    console.log(`  ✓ Created ${courses.length} courses`);

    // 3. Insert Standard Training Vehicles
    console.log('\nCreating Fleet Vehicles...');
    const vehicles = [
      {
        reg: 'MH-24-AG-1001',
        model: 'Maruti Suzuki Swift VXi',
        cat: 'Four-Wheeler',
        trans: 'Manual',
        dual: 1,
        fitness: '2028-05-15',
        insurance: '2027-04-10'
      },
      {
        reg: 'MH-24-AG-1002',
        model: 'Hyundai i20 Sportz (Auto)',
        cat: 'Four-Wheeler',
        trans: 'Automatic',
        dual: 1,
        fitness: '2028-08-20',
        insurance: '2027-07-15'
      },
      {
        reg: 'MH-24-AG-1003',
        model: 'Honda Activa 6G (MCWG)',
        cat: 'Two-Wheeler',
        trans: 'Automatic',
        dual: 0,
        fitness: '2029-01-10',
        insurance: '2027-09-30'
      },
      {
        reg: 'MH-24-AG-1004',
        model: 'Tata 407 LPT (Commercial)',
        cat: 'Commercial',
        trans: 'Manual',
        dual: 1,
        fitness: '2027-11-25',
        insurance: '2027-06-18'
      }
    ];

    for (const v of vehicles) {
      await connection.query(
        `INSERT INTO VehicleMaster (RegistrationNumber, ModelType, Category, Transmission, HasDualControl, FitnessExpiryDate, InsuranceExpiryDate, Status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Available')`,
        [v.reg, v.model, v.cat, v.trans, v.dual, v.fitness, v.insurance]
      );
    }
    console.log(`  ✓ Created ${vehicles.length} vehicles`);

    // 4. Insert Standard Session Slots
    console.log('\nCreating Standard Session Slots...');
    const sessionSlots = [
      { name: 'Morning Batch Slot 1', start: '07:00:00', end: '08:00:00' },
      { name: 'Morning Batch Slot 2', start: '08:00:00', end: '09:00:00' },
      { name: 'Morning Batch Slot 3', start: '09:00:00', end: '10:00:00' },
      { name: 'Evening Batch Slot 1', start: '16:00:00', end: '17:00:00' },
      { name: 'Evening Batch Slot 2', start: '17:00:00', end: '18:00:00' },
      { name: 'Evening Batch Slot 3', start: '18:00:00', end: '19:00:00' }
    ];

    for (const s of sessionSlots) {
      await connection.query(
        'INSERT INTO SessionMaster (SessionName, StartTime, EndTime, CapacityPerSlot, Status) VALUES (?, ?, ?, 1, "Active")',
        [s.name, s.start, s.end]
      );
    }
    console.log(`  ✓ Created ${sessionSlots.length} standard training slots`);

    // 5. Insert Users (Admin, Instructors, Students)
    console.log('\nCreating User Accounts...');
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const instructorHash = await bcrypt.hash('Instructor@123', 10);
    const studentHash = await bcrypt.hash('Student@123', 10);

    const users = [
      {
        name: 'Chief Administrator',
        email: 'admin@drivingschool.com',
        hash: adminHash,
        role: 'Admin',
        phone: '9876543210',
        llr: null,
        address: 'COCSIT Campus, Ambajogai Road, Latur'
      },
      {
        name: 'Rajesh Patil (Senior Instructor)',
        email: 'rajesh.patil@drivingschool.com',
        hash: instructorHash,
        role: 'Instructor',
        phone: '9822012345',
        llr: null,
        address: 'Shivaji Nagar, Latur'
      },
      {
        name: 'Amit Shinde (Instructor)',
        email: 'amit.shinde@drivingschool.com',
        hash: instructorHash,
        role: 'Instructor',
        phone: '9822067890',
        llr: null,
        address: 'MIDC Road, Latur'
      },
      {
        name: 'Radheya Bharat Khandelwal',
        email: 'radheya.khandelwal@student.com',
        hash: studentHash,
        role: 'Student',
        phone: '9423011223',
        llr: 'MH-24-LLR-2026-0042',
        address: 'Ausa Road, Latur, Maharashtra'
      },
      {
        name: 'Priya Sunil Sharma',
        email: 'priya.sharma@student.com',
        hash: studentHash,
        role: 'Student',
        phone: '9423044556',
        llr: 'MH-24-LLR-2026-0089',
        address: 'Barshi Road, Latur, Maharashtra'
      }
    ];

    for (const u of users) {
      await connection.query(
        `INSERT INTO UserMaster (FullName, Email, PasswordHash, Role, Phone, LLRNumber, Address, Status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
        [u.name, u.email, u.hash, u.role, u.phone, u.llr, u.address]
      );
    }
    console.log(`  ✓ Created ${users.length} user accounts`);

    // Fetch newly created IDs
    const [userRows] = await connection.query('SELECT UserID, Email FROM UserMaster');
    const userMap = {};
    userRows.forEach(u => { userMap[u.Email] = u.UserID; });

    const [vehicleRows] = await connection.query('SELECT VehicleID, RegistrationNumber FROM VehicleMaster');
    const vehicleMap = {};
    vehicleRows.forEach(v => { vehicleMap[v.RegistrationNumber] = v.VehicleID; });

    const [courseRows] = await connection.query('SELECT CourseID, CourseCode FROM CourseMaster');
    const courseMap = {};
    courseRows.forEach(c => { courseMap[c.CourseCode] = c.CourseID; });

    // 6. Insert Certified Instructor Profiles
    console.log('\nCreating Instructor Profiles...');
    const instructors = [
      {
        email: 'rajesh.patil@drivingschool.com',
        lic: 'MH-24-INST-2015-098',
        expiry: '2030-01-01',
        spec: 'Four-Wheeler (Manual & Hill Starts)',
        exp: 9,
        vehReg: 'MH-24-AG-1001',
        salary: 32000.00
      },
      {
        email: 'amit.shinde@drivingschool.com',
        lic: 'MH-24-INST-2018-442',
        expiry: '2031-06-15',
        spec: 'Automatic Transmission & Parallel Parking',
        exp: 6,
        vehReg: 'MH-24-AG-1002',
        salary: 28000.00
      }
    ];

    for (const inst of instructors) {
      const uId = userMap[inst.email];
      const vId = vehicleMap[inst.vehReg];
      await connection.query(
        `INSERT INTO InstructorMaster (UserID, LicenseNumber, LicenseExpiryDate, Specialization, ExperienceYears, AssignedVehicleID, Salary, Status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
        [uId, inst.lic, inst.expiry, inst.spec, inst.exp, vId, inst.salary]
      );
    }
    console.log(`  ✓ Created ${instructors.length} certified instructor profiles`);

    // 7. Insert Clean Student Enrollments (Payment & Booking Pending Finalization)
    console.log('\nCreating Student Enrollments (Without past activity)...');

    // Tomorrow's date for scheduled training start
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const dayAfterTomorrow = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

    // Student 1: Radheya (Four-Wheeler Manual)
    const student1Id = userMap['radheya.khandelwal@student.com'];
    const course1Id = courseMap['COURSE-LMV-MANUAL'];

    // Payment Record
    await connection.query(
      `INSERT INTO PaymentMaster (StudentID, CourseID, InvoiceNumber, TotalAmount, AmountPaid, BalanceAmount, PaymentMethod, TransactionReference, PaymentStatus)
       VALUES (?, ?, 'INV-2026-0001', 6500.00, 6500.00, 0.00, 'UPI_Simulated', 'TXN-UPI-20261025-1001', 'Completed')`,
      [student1Id, course1Id]
    );

    // Initial Booking / Schedule Slot (Pending Admin Finalization & Trainer Assignment)
    await connection.query(
      `INSERT INTO BookingMaster (StudentID, CourseID, InstructorID, VehicleID, SessionDate, TimeSlot, Status, Notes)
       VALUES (?, ?, NULL, NULL, ?, '07:00:00 - 08:00:00', 'Pending', 'Course Enrollment: Four-Wheeler Comprehensive (LMV-Manual). Preferred Slot: 07:00 AM - 08:00 AM')`,
      [student1Id, course1Id, tomorrow]
    );

    // Student 2: Priya (Four-Wheeler Automatic)
    const student2Id = userMap['priya.sharma@student.com'];
    const course2Id = courseMap['COURSE-LMV-AUTO'];

    await connection.query(
      `INSERT INTO PaymentMaster (StudentID, CourseID, InvoiceNumber, TotalAmount, AmountPaid, BalanceAmount, PaymentMethod, TransactionReference, PaymentStatus)
       VALUES (?, ?, 'INV-2026-0002', 7500.00, 7500.00, 0.00, 'UPI_Simulated', 'TXN-UPI-20261025-1002', 'Completed')`,
      [student2Id, course2Id]
    );

    await connection.query(
      `INSERT INTO BookingMaster (StudentID, CourseID, InstructorID, VehicleID, SessionDate, TimeSlot, Status, Notes)
       VALUES (?, ?, NULL, NULL, ?, '09:00:00 - 10:00:00', 'Pending', 'Course Enrollment: Four-Wheeler Premium (LMV-Auto). Preferred Slot: 09:00 AM - 10:00 AM')`,
      [student2Id, course2Id, dayAfterTomorrow]
    );

    console.log('  ✓ Created enrollments and 100% paid invoices for Radheya and Priya');
    console.log('  ✓ Set slot status to "Pending" ready for Admin finalization & trainer assignment');
    console.log('  ✓ Kept AttendanceMaster (0 records) - No attendance logged yet');
    console.log('  ✓ Kept TestScheduleMaster (0 records) - No mock tests taken yet');

    // 8. Summary of Created Accounts
    console.log('\n======================================================');
    console.log(' DATABASE INITIALIZATION & RESET COMPLETE ');
    console.log('======================================================');
    const [finalUsers] = await connection.query('SELECT UserID, FullName, Email, Role, Phone FROM UserMaster ORDER BY UserID ASC');
    console.table(finalUsers);

    process.exit(0);
  } catch (err) {
    console.error('Reset failed:', err);
    process.exit(1);
  } finally {
    connection.release();
  }
}

cleanAndResetData();
