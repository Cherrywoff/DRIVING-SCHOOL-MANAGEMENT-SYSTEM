const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function seedData() {
  console.log('Starting idempotent database seeding...');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Seed Users
    console.log('Seeding Users...');
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
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')
         ON DUPLICATE KEY UPDATE FullName = VALUES(FullName), Phone = VALUES(Phone), LLRNumber = VALUES(LLRNumber), Address = VALUES(Address)`,
        [u.name, u.email, u.hash, u.role, u.phone, u.llr, u.address]
      );
    }

    // Retrieve user IDs
    const [userRows] = await connection.query('SELECT UserID, Email FROM UserMaster');
    const userMap = {};
    userRows.forEach(u => { userMap[u.Email] = u.UserID; });

    // 2. Seed Vehicles
    console.log('Seeding Vehicles...');
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
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Available')
         ON DUPLICATE KEY UPDATE ModelType = VALUES(ModelType), Status = VALUES(Status)`,
        [v.reg, v.model, v.cat, v.trans, v.dual, v.fitness, v.insurance]
      );
    }

    const [vehicleRows] = await connection.query('SELECT VehicleID, RegistrationNumber FROM VehicleMaster');
    const vehicleMap = {};
    vehicleRows.forEach(v => { vehicleMap[v.RegistrationNumber] = v.VehicleID; });

    // 3. Seed Instructors
    console.log('Seeding Instructors...');
    const instructors = [
      {
        email: 'rajesh.patil@drivingschool.com',
        lic: 'MH-24-INST-2015-098',
        expiry: '2030-01-01',
        spec: 'Four-Wheeler (Manual & Hill Starts)',
        exp: 9,
        vehReg: 'MH-24-AG-1001'
      },
      {
        email: 'amit.shinde@drivingschool.com',
        lic: 'MH-24-INST-2018-442',
        expiry: '2031-06-15',
        spec: 'Automatic Transmission & Parallel Parking',
        exp: 6,
        vehReg: 'MH-24-AG-1002'
      }
    ];

    for (const inst of instructors) {
      const uId = userMap[inst.email];
      const vId = vehicleMap[inst.vehReg];
      if (uId) {
        await connection.query(
          `INSERT INTO InstructorMaster (UserID, LicenseNumber, LicenseExpiryDate, Specialization, ExperienceYears, AssignedVehicleID, Status)
           VALUES (?, ?, ?, ?, ?, ?, 'Active')
           ON DUPLICATE KEY UPDATE Specialization = VALUES(Specialization), ExperienceYears = VALUES(ExperienceYears), AssignedVehicleID = VALUES(AssignedVehicleID)`,
          [uId, inst.lic, inst.expiry, inst.spec, inst.exp, vId]
        );
      }
    }

    const [instRows] = await connection.query('SELECT InstructorID, UserID FROM InstructorMaster');
    const instUserMap = {};
    instRows.forEach(i => { instUserMap[i.UserID] = i.InstructorID; });

    // 4. Seed Courses
    console.log('Seeding Courses...');
    const courses = [
      {
        code: 'COURSE-MCWG',
        name: 'Two-Wheeler Complete Driving Program (MCWG)',
        cat: 'Two-Wheeler (MCWG)',
        desc: 'Comprehensive training for gear and non-gear two-wheelers including balance control, traffic signals, road etiquettes, and slalom cone navigation.',
        days: 15,
        theory: 10,
        prac: 15,
        fee: 3500.00
      },
      {
        code: 'COURSE-LMV-MANUAL',
        name: 'Four-Wheeler Comprehensive Driving (LMV-Manual)',
        cat: 'Four-Wheeler (LMV-Manual)',
        desc: 'Complete light motor vehicle manual driving course covering clutch friction point, gear transmission, parallel parking, reversing, and city traffic navigation.',
        days: 30,
        theory: 15,
        prac: 25,
        fee: 6500.00
      },
      {
        code: 'COURSE-LMV-AUTO',
        name: 'Four-Wheeler Premium Automatic (LMV-Auto)',
        cat: 'Four-Wheeler (LMV-Auto)',
        desc: 'Modern driver training for automatic transmission vehicles covering smooth acceleration, cruise safety, hill hold assist, and emergency braking techniques.',
        days: 25,
        theory: 12,
        prac: 20,
        fee: 7500.00
      },
      {
        code: 'COURSE-COMBO',
        name: 'Dual Combo Driver License Package (MCWG + LMV-Manual)',
        cat: 'Four-Wheeler (LMV-Manual)',
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
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
         ON DUPLICATE KEY UPDATE CourseName = VALUES(CourseName), Fee = VALUES(Fee), Description = VALUES(Description)`,
        [c.code, c.name, c.cat, c.desc, c.days, c.theory, c.prac, c.fee]
      );
    }

    const [courseRows] = await connection.query('SELECT CourseID, CourseCode FROM CourseMaster');
    const courseMap = {};
    courseRows.forEach(c => { courseMap[c.CourseCode] = c.CourseID; });

    // 5. Seed Sessions
    console.log('Seeding Standard Session Slots...');
    const sessions = [
      { name: 'Morning Batch Slot 1', start: '07:00:00', end: '08:00:00' },
      { name: 'Morning Batch Slot 2', start: '08:00:00', end: '09:00:00' },
      { name: 'Morning Batch Slot 3', start: '09:00:00', end: '10:00:00' },
      { name: 'Evening Batch Slot 1', start: '16:00:00', end: '17:00:00' },
      { name: 'Evening Batch Slot 2', start: '17:00:00', end: '18:00:00' },
      { name: 'Evening Batch Slot 3', start: '18:00:00', end: '19:00:00' }
    ];

    for (const s of sessions) {
      const [existing] = await connection.query('SELECT SessionID FROM SessionMaster WHERE SessionName = ?', [s.name]);
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO SessionMaster (SessionName, StartTime, EndTime, CapacityPerSlot, Status) VALUES (?, ?, ?, 1, "Active")',
          [s.name, s.start, s.end]
        );
      }
    }

    // 6. Seed Sample Payments & Bookings for Radheya
    console.log('Seeding Student Enrollment, Booking & Payment records...');
    const studentRadheyaId = userMap['radheya.khandelwal@student.com'];
    const courseLmvId = courseMap['COURSE-LMV-MANUAL'];
    const instRajeshId = instUserMap[userMap['rajesh.patil@drivingschool.com']];
    const vehSwiftId = vehicleMap['MH-24-AG-1001'];

    if (studentRadheyaId && courseLmvId && instRajeshId && vehSwiftId) {
      // Payment Record
      await connection.query(
        `INSERT INTO PaymentMaster (StudentID, CourseID, InvoiceNumber, TotalAmount, AmountPaid, BalanceAmount, PaymentMethod, TransactionReference, PaymentStatus)
         VALUES (?, ?, 'INV-2026-001', 6500.00, 6500.00, 0.00, 'UPI_Simulated', 'TXN-UPI-20261021-9988', 'Completed')
         ON DUPLICATE KEY UPDATE TotalAmount = VALUES(TotalAmount)`,
        [studentRadheyaId, courseLmvId]
      );

      // Bookings (Today & Tomorrow)
      const today = new Date().toISOString().slice(0, 10);
      const tomorrowDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

      // Booking 1
      await connection.query(
        `INSERT IGNORE INTO BookingMaster (StudentID, CourseID, InstructorID, VehicleID, SessionDate, TimeSlot, Status, Notes)
         VALUES (?, ?, ?, ?, ?, '07:00:00 - 08:00:00', 'Completed', 'Day 1: Basic cockpit drill and clutch pedal control')`,
        [studentRadheyaId, courseLmvId, instRajeshId, vehSwiftId, today]
      );

      // Booking 2
      await connection.query(
        `INSERT IGNORE INTO BookingMaster (StudentID, CourseID, InstructorID, VehicleID, SessionDate, TimeSlot, Status, Notes)
         VALUES (?, ?, ?, ?, ?, '08:00:00 - 09:00:00', 'Scheduled', 'Day 2: Gear shift progression and parallel steering')`,
        [studentRadheyaId, courseLmvId, instRajeshId, vehSwiftId, tomorrowDate]
      );

      // Attendance for completed booking
      const [bRows] = await connection.query(
        'SELECT BookingID FROM BookingMaster WHERE StudentID = ? AND SessionDate = ?',
        [studentRadheyaId, today]
      );
      if (bRows.length > 0) {
        await connection.query(
          `INSERT INTO AttendanceMaster (BookingID, StudentID, InstructorID, SessionDate, AttendanceStatus, KilometersDriven, TopicsCovered, CompetencyRating, InstructorFeedback)
           VALUES (?, ?, ?, ?, 'Present', 8.50, 'Cockpit drill, seat adjustment, ABC pedals (Accelerator, Brake, Clutch), smooth start-stop', 4, 'Excellent clutch balance. Confident first drive.')
           ON DUPLICATE KEY UPDATE KilometersDriven = VALUES(KilometersDriven)`,
          [bRows[0].BookingID, studentRadheyaId, instRajeshId, today]
        );
      }

      // Test Schedules
      await connection.query(
        `INSERT INTO TestScheduleMaster (StudentID, CourseID, TestType, TestDate, TestTime, ScoreObtained, TotalScore, ResultStatus, ExaminerOrInstructorNotes)
         VALUES (?, ?, 'Theory_Mock_Quiz', ?, '10:30:00', 88.00, 100.00, 'Passed', 'High score on traffic sign recognition and overtaking regulations.')
         ON DUPLICATE KEY UPDATE ScoreObtained = VALUES(ScoreObtained)`,
        [studentRadheyaId, courseLmvId, today]
      );

      const rtoDate = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
      await connection.query(
        `INSERT INTO TestScheduleMaster (StudentID, CourseID, TestType, TestDate, TestTime, ScoreObtained, TotalScore, ResultStatus, ExaminerOrInstructorNotes)
         VALUES (?, ?, 'Official_RTO_Test', ?, '11:00:00', NULL, 100.00, 'Scheduled', 'Official RTO Latur H-Track Practical Driving Test scheduled.')
         ON DUPLICATE KEY UPDATE TestDate = VALUES(TestDate)`,
        [studentRadheyaId, courseLmvId, rtoDate]
      );
    }

    await connection.commit();
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    await connection.rollback();
    console.error('Seeding failed:', err.message);
    process.exit(1);
  } finally {
    connection.release();
  }
}

seedData();
