const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function seedRichHistory() {
  console.log('=== POPULATING RICH HISTORICAL DATA (INDIAN TIMELINE) ===');
  const connection = await pool.getConnection();

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    console.log('1. Clearing existing tables...');
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
    for (const t of tables) {
      await connection.query(`TRUNCATE TABLE ${t}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('   ✓ Tables cleared');

    // 2. Courses
    console.log('2. Inserting Courses...');
    const courses = [
      {
        code: 'COURSE-MCWG',
        name: 'Two-Wheeler Complete Driving Program (MCWG)',
        category: 'Two-Wheeler (MCWG)',
        desc: 'Comprehensive motorcycle and scooter training covering balance control, slalom cone drills, traffic signal discipline, pillion safety, and RTO 8-track maneuvers.',
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
    console.log('   ✓ 4 Courses created');

    // 3. Vehicles
    console.log('3. Inserting Dual-Control Fleet Vehicles...');
    const vehicles = [
      {
        reg: 'MH-24-AG-1001',
        model: 'Maruti Suzuki Swift VXi (Dual Pedals)',
        cat: 'Four-Wheeler',
        trans: 'Manual',
        dual: 1,
        fitness: '2028-05-15',
        insurance: '2027-04-10',
        status: 'Available'
      },
      {
        reg: 'MH-24-AG-1002',
        model: 'Hyundai i20 Sportz (Auto Dual Control)',
        cat: 'Four-Wheeler',
        trans: 'Automatic',
        dual: 1,
        fitness: '2028-08-20',
        insurance: '2027-07-15',
        status: 'Available'
      },
      {
        reg: 'MH-24-AG-1003',
        model: 'Honda Activa 6G (MCWG Training)',
        cat: 'Two-Wheeler',
        trans: 'Automatic',
        dual: 0,
        fitness: '2029-01-10',
        insurance: '2027-09-30',
        status: 'Available'
      },
      {
        reg: 'MH-24-AG-1004',
        model: 'Tata 407 LPT (Commercial Trainer)',
        cat: 'Commercial',
        trans: 'Manual',
        dual: 1,
        fitness: '2027-11-25',
        insurance: '2027-06-18',
        status: 'Available'
      }
    ];

    for (const v of vehicles) {
      await connection.query(
        `INSERT INTO VehicleMaster (RegistrationNumber, ModelType, Category, Transmission, HasDualControl, FitnessExpiryDate, InsuranceExpiryDate, Status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.reg, v.model, v.cat, v.trans, v.dual, v.fitness, v.insurance, v.status]
      );
    }
    console.log('   ✓ 4 Vehicles created');

    // 4. Session Slots
    console.log('4. Inserting Standard Session Slots...');
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
    console.log('   ✓ 6 Standard training slots created');

    // 5. Users
    console.log('5. Inserting Users with established history...');
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const instructorHash = await bcrypt.hash('Instructor@123', 10);
    const studentHash = await bcrypt.hash('Student@123', 10);

    const users = [
      // 1. Admin
      {
        name: 'Chief Administrator',
        email: 'admin@drivingschool.com',
        hash: adminHash,
        role: 'Admin',
        phone: '9876543210',
        llr: null,
        address: 'COCSIT Campus, Ambajogai Road, Latur',
        createdAt: '2026-06-01 10:00:00'
      },
      // 2. Instructor 1
      {
        name: 'Rajesh Patil (Senior Instructor)',
        email: 'rajesh.patil@drivingschool.com',
        hash: instructorHash,
        role: 'Instructor',
        phone: '9822012345',
        llr: null,
        address: 'Shivaji Nagar, Latur',
        createdAt: '2026-06-15 09:30:00'
      },
      // 3. Instructor 2
      {
        name: 'Amit Shinde (Instructor)',
        email: 'amit.shinde@drivingschool.com',
        hash: instructorHash,
        role: 'Instructor',
        phone: '9822067890',
        llr: null,
        address: 'MIDC Road, Latur',
        createdAt: '2026-07-01 11:00:00'
      },
      // 4. Instructor 3
      {
        name: 'Sanjay Deshmukh (Commercial & 2W Trainer)',
        email: 'sanjay.deshmukh@drivingschool.com',
        hash: instructorHash,
        role: 'Instructor',
        phone: '9822088776',
        llr: null,
        address: 'Khadgaon Road, Latur',
        createdAt: '2026-07-15 10:15:00'
      },
      // 5. Student 1: Radheya Bharat Khandelwal
      {
        name: 'Radheya Bharat Khandelwal',
        email: 'radheya.khandelwal@student.com',
        hash: studentHash,
        role: 'Student',
        phone: '9423011223',
        llr: 'MH-24-LLR-2026-0042',
        address: 'Ausa Road, Near Reliance Mall, Latur',
        createdAt: '2026-09-01 11:30:00'
      },
      // 6. Student 2: Priya Sunil Sharma
      {
        name: 'Priya Sunil Sharma',
        email: 'priya.sharma@student.com',
        hash: studentHash,
        role: 'Student',
        phone: '9423044556',
        llr: 'MH-24-LLR-2026-0089',
        address: 'Barshi Road, Near Collector Office, Latur',
        createdAt: '2026-09-10 14:15:00'
      },
      // 7. Student 3: Rohan Deepak Deshmukh
      {
        name: 'Rohan Deepak Deshmukh',
        email: 'rohan.deshmukh@student.com',
        hash: studentHash,
        role: 'Student',
        phone: '9423077889',
        llr: 'MH-24-LLR-2026-0115',
        address: 'MIDC Phase 2, Latur',
        createdAt: '2026-09-18 16:45:00'
      },
      // 8. Student 4: Snehal Ramesh Patil
      {
        name: 'Snehal Ramesh Patil',
        email: 'snehal.patil@student.com',
        hash: studentHash,
        role: 'Student',
        phone: '9423099001',
        llr: 'MH-24-LLR-2026-0144',
        address: 'Khadgaon Road, Latur',
        createdAt: '2026-09-25 10:20:00'
      },
      // 9. Student 5: Aniket Vijay Kulkarni (Recent Enrollment, Pending Slot)
      {
        name: 'Aniket Vijay Kulkarni',
        email: 'aniket.kulkarni@student.com',
        hash: studentHash,
        role: 'Student',
        phone: '9423022334',
        llr: 'MH-24-LLR-2026-0182',
        address: 'Old Ausa Road, Latur',
        createdAt: '2026-10-20 12:00:00'
      },
      // 10. Student 6: Tanvi Mahesh Joshi
      {
        name: 'Tanvi Mahesh Joshi',
        email: 'tanvi.joshi@student.com',
        hash: studentHash,
        role: 'Student',
        phone: '9423055667',
        llr: 'MH-24-LLR-2026-0205',
        address: 'Samarth Nagar, Latur',
        createdAt: '2026-10-12 15:30:00'
      }
    ];

    for (const u of users) {
      await connection.query(
        `INSERT INTO UserMaster (FullName, Email, PasswordHash, Role, Phone, LLRNumber, Address, Status, CreatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', ?)`,
        [u.name, u.email, u.hash, u.role, u.phone, u.llr, u.address, u.createdAt]
      );
    }
    console.log('   ✓ 10 User accounts created');

    // Retrieve IDs
    const [userRows] = await connection.query('SELECT UserID, Email FROM UserMaster');
    const uMap = {};
    userRows.forEach(u => { uMap[u.Email] = u.UserID; });

    const [vehicleRows] = await connection.query('SELECT VehicleID, RegistrationNumber FROM VehicleMaster');
    const vMap = {};
    vehicleRows.forEach(v => { vMap[v.RegistrationNumber] = v.VehicleID; });

    const [courseRows] = await connection.query('SELECT CourseID, CourseCode, Fee FROM CourseMaster');
    const cMap = {};
    courseRows.forEach(c => { cMap[c.CourseCode] = { id: c.CourseID, fee: c.Fee }; });

    // 6. Instructor Profiles
    console.log('6. Inserting Certified Instructor Profiles...');
    const instructors = [
      {
        email: 'rajesh.patil@drivingschool.com',
        lic: 'MH-24-INST-2015-098',
        expiry: '2030-01-01',
        spec: 'Four-Wheeler Manual, Clutch Balance & Hill Starts',
        exp: 9,
        vReg: 'MH-24-AG-1001',
        salary: 32000.00
      },
      {
        email: 'amit.shinde@drivingschool.com',
        lic: 'MH-24-INST-2018-442',
        expiry: '2031-06-15',
        spec: 'Automatic Transmission, Parallel Parking & Reverse Bay',
        exp: 6,
        vReg: 'MH-24-AG-1002',
        salary: 28000.00
      },
      {
        email: 'sanjay.deshmukh@drivingschool.com',
        lic: 'MH-24-INST-2012-301',
        expiry: '2032-09-30',
        spec: 'Commercial HMV, Dual Combo & Two-Wheeler MCWG',
        exp: 12,
        vReg: 'MH-24-AG-1004',
        salary: 35000.00
      }
    ];

    for (const inst of instructors) {
      await connection.query(
        `INSERT INTO InstructorMaster (UserID, LicenseNumber, LicenseExpiryDate, Specialization, ExperienceYears, AssignedVehicleID, Salary, Status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
        [uMap[inst.email], inst.lic, inst.expiry, inst.spec, inst.exp, vMap[inst.vReg], inst.salary]
      );
    }
    console.log('   ✓ 3 Instructor profiles created');

    const [instRows] = await connection.query('SELECT InstructorID, UserID FROM InstructorMaster');
    const instMap = {};
    instRows.forEach(i => { instMap[i.UserID] = i.InstructorID; });

    const instRajesh = instMap[uMap['rajesh.patil@drivingschool.com']];
    const instAmit = instMap[uMap['amit.shinde@drivingschool.com']];
    const instSanjay = instMap[uMap['sanjay.deshmukh@drivingschool.com']];

    const carSwift = vMap['MH-24-AG-1001'];
    const carI20 = vMap['MH-24-AG-1002'];
    const bikeActiva = vMap['MH-24-AG-1003'];
    const truckTata = vMap['MH-24-AG-1004'];

    // 7. Student Payments (100% Full Payment Model)
    console.log('7. Inserting Student Payment Records...');
    const payments = [
      {
        email: 'radheya.khandelwal@student.com',
        code: 'COURSE-LMV-MANUAL',
        inv: 'INV-2026-0001',
        amount: 6500.00,
        ref: 'TXN-UPI-20260901-8841',
        method: 'UPI_Simulated',
        date: '2026-09-01 12:00:00'
      },
      {
        email: 'priya.sharma@student.com',
        code: 'COURSE-LMV-AUTO',
        inv: 'INV-2026-0002',
        amount: 7500.00,
        ref: 'TXN-UPI-20260910-4492',
        method: 'UPI_Simulated',
        date: '2026-09-10 14:30:00'
      },
      {
        email: 'rohan.deshmukh@student.com',
        code: 'COURSE-COMBO',
        inv: 'INV-2026-0003',
        amount: 9000.00,
        ref: 'TXN-UPI-20260918-1120',
        method: 'UPI_Simulated',
        date: '2026-09-18 17:00:00'
      },
      {
        email: 'snehal.patil@student.com',
        code: 'COURSE-MCWG',
        inv: 'INV-2026-0004',
        amount: 3500.00,
        ref: 'TXN-UPI-20260925-9932',
        method: 'UPI_Simulated',
        date: '2026-09-25 11:00:00'
      },
      {
        email: 'aniket.kulkarni@student.com',
        code: 'COURSE-LMV-MANUAL',
        inv: 'INV-2026-0005',
        amount: 6500.00,
        ref: 'TXN-UPI-20261020-6644',
        method: 'UPI_Simulated',
        date: '2026-10-20 12:30:00'
      },
      {
        email: 'tanvi.joshi@student.com',
        code: 'COURSE-LMV-AUTO',
        inv: 'INV-2026-0006',
        amount: 7500.00,
        ref: 'TXN-UPI-20261012-3310',
        method: 'UPI_Simulated',
        date: '2026-10-12 16:00:00'
      }
    ];

    for (const p of payments) {
      await connection.query(
        `INSERT INTO PaymentMaster (StudentID, CourseID, InvoiceNumber, TotalAmount, AmountPaid, BalanceAmount, PaymentMethod, TransactionReference, PaymentStatus, PaymentDate)
         VALUES (?, ?, ?, ?, ?, 0.00, ?, ?, 'Completed', ?)`,
        [uMap[p.email], cMap[p.code].id, p.inv, p.amount, p.amount, p.method, p.ref, p.date]
      );
    }
    console.log('   ✓ 6 Invoices created (Total fee collection: ₹40,500.00)');

    // 8. Bookings & Sessions (Past completed + Upcoming scheduled + Pending for admin demo)
    console.log('8. Inserting Realistic Driving Sessions & Historical Logs...');

    // Helper function to insert booking and return ID
    async function createBooking(studentEmail, courseCode, instId, vehId, date, slot, status, notes, createdAt) {
      const [res] = await connection.query(
        `INSERT INTO BookingMaster (StudentID, CourseID, InstructorID, VehicleID, SessionDate, TimeSlot, Status, Notes, CreatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uMap[studentEmail], cMap[courseCode].id, instId, vehId, date, slot, status, notes, createdAt]
      );
      return res.insertId;
    }

    // Helper function to insert attendance
    async function logAttendance(bookingId, studentEmail, instId, date, status, km, topics, rating, feedback, loggedAt) {
      await connection.query(
        `INSERT INTO AttendanceMaster (BookingID, StudentID, InstructorID, SessionDate, AttendanceStatus, KilometersDriven, TopicsCovered, CompetencyRating, InstructorFeedback, LoggedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [bookingId, uMap[studentEmail], instId, date, status, km, topics, rating, feedback, loggedAt]
      );
    }

    // --- STUDENT 1: Radheya Bharat Khandelwal (Advanced Manual Learner) ---
    // Session 1: Cockpit Drill & ABC Controls (Completed)
    const b1 = await createBooking(
      'radheya.khandelwal@student.com', 'COURSE-LMV-MANUAL', instRajesh, carSwift,
      '2026-09-05', '07:00:00 - 08:00:00', 'Completed',
      'Day 1: Cockpit drill, seat & mirror adjustments, clutch pedal biting point',
      '2026-09-02 10:00:00'
    );
    await logAttendance(b1, 'radheya.khandelwal@student.com', instRajesh, '2026-09-05', 'Present', 8.50,
      'Cockpit orientation, ABC pedals (Accelerator, Brake, Clutch), smooth start-stop in 1st gear',
      4, 'Excellent clutch control. Smooth start without engine stalling. Very attentive to dashboard gauges.',
      '2026-09-05 08:15:00'
    );

    // Session 2: Gear Shift Progression & Steering (Completed)
    const b2 = await createBooking(
      'radheya.khandelwal@student.com', 'COURSE-LMV-MANUAL', instRajesh, carSwift,
      '2026-09-12', '07:00:00 - 08:00:00', 'Completed',
      'Day 2: Gear changes 1st to 3rd, hand-over-hand steering technique on ring road',
      '2026-09-08 11:00:00'
    );
    await logAttendance(b2, 'radheya.khandelwal@student.com', instRajesh, '2026-09-12', 'Present', 12.00,
      'Up-shifting 1-2-3, progressive braking, left and right turns on Shivaji Nagar ring road',
      5, 'Flawless steering recovery after cornering. Smooth gear transitions and proper mirror checks.',
      '2026-09-12 08:10:00'
    );

    // Session 3: Parallel Parking & Reverse Bay Parking (Completed)
    const b3 = await createBooking(
      'radheya.khandelwal@student.com', 'COURSE-LMV-MANUAL', instRajesh, carSwift,
      '2026-09-20', '07:00:00 - 08:00:00', 'Completed',
      'Day 3: Parallel curb parking, reversing into bays using side mirrors',
      '2026-09-15 09:30:00'
    );
    await logAttendance(b3, 'radheya.khandelwal@student.com', instRajesh, '2026-09-20', 'Present', 9.20,
      'Parallel parking between training cones, 45-degree angle reverse entry, blind spot awareness',
      4, 'Successfully completed parallel parking within the 1-foot curb margin on second attempt.',
      '2026-09-20 08:15:00'
    );

    // Session 4: Hill Start with Handbrake Drill (Completed)
    const b4 = await createBooking(
      'radheya.khandelwal@student.com', 'COURSE-LMV-MANUAL', instRajesh, carSwift,
      '2026-10-02', '07:00:00 - 08:00:00', 'Completed',
      'Day 4: Gradient start on Ambajogai road flyover incline using parking brake',
      '2026-09-28 14:00:00'
    );
    await logAttendance(b4, 'radheya.khandelwal@student.com', instRajesh, '2026-10-02', 'Present', 14.50,
      'Steep incline start, parking brake coordination with clutch bite, avoiding rollback',
      5, 'Zero rollback on 15% incline. Mastered the handbrake clutch coordination. Exam-ready.',
      '2026-10-02 08:20:00'
    );

    // Session 5: Night Driving & Highway Lane Discipline (Completed)
    const b5 = await createBooking(
      'radheya.khandelwal@student.com', 'COURSE-LMV-MANUAL', instRajesh, carSwift,
      '2026-10-15', '18:00:00 - 19:00:00', 'Completed',
      'Day 5: Night driving on Ausa Road highway, high/low beam etiquette, safe overtaking',
      '2026-10-10 16:00:00'
    );
    await logAttendance(b5, 'radheya.khandelwal@student.com', instRajesh, '2026-10-15', 'Present', 16.80,
      'High-beam dipper etiquette, maintaining 3-second gap, lane positioning at 60 km/h',
      5, 'Outstanding confidence in night traffic. Dipped headlights promptly for oncoming traffic.',
      '2026-10-15 19:10:00'
    );

    // Session 6: Upcoming Scheduled Practical Session
    await createBooking(
      'radheya.khandelwal@student.com', 'COURSE-LMV-MANUAL', instRajesh, carSwift,
      '2026-10-26', '07:00:00 - 08:00:00', 'Scheduled',
      'Day 6: Final RTO H-Track simulation and emergency stopping distance assessment',
      '2026-10-20 10:00:00'
    );

    // --- STUDENT 2: Priya Sunil Sharma (Automatic Transmission) ---
    // Session 1: Automatic Controls (Completed)
    const b7 = await createBooking(
      'priya.sharma@student.com', 'COURSE-LMV-AUTO', instAmit, carI20,
      '2026-09-15', '09:00:00 - 10:00:00', 'Completed',
      'Day 1: Automatic selector PRND, creep function, smooth single-pedal braking',
      '2026-09-11 10:00:00'
    );
    await logAttendance(b7, 'priya.sharma@student.com', instAmit, '2026-09-15', 'Present', 7.50,
      'Cockpit orientation, PRND shifter, creeping speed in traffic, gradual stopping',
      4, 'Good road awareness. Gently applied brakes without sudden jolts. Confident posture.',
      '2026-09-15 10:10:00'
    );

    // Session 2: City Traffic & Roundabouts (Completed)
    const b8 = await createBooking(
      'priya.sharma@student.com', 'COURSE-LMV-AUTO', instAmit, carI20,
      '2026-09-28', '09:00:00 - 10:00:00', 'Completed',
      'Day 2: City market navigation, roundabout right-of-way rules, pedestrian crosswalks',
      '2026-09-22 11:30:00'
    );
    await logAttendance(b8, 'priya.sharma@student.com', instAmit, '2026-09-28', 'Present', 11.20,
      'Navigating Shivaji Chowk circle, indicator signaling 30m prior, yield etiquette',
      4, 'Great understanding of roundabout priority. Used indicators accurately at all turns.',
      '2026-09-28 10:15:00'
    );

    // Session 3: Reverse Camera & Bay Parking (Completed)
    const b9 = await createBooking(
      'priya.sharma@student.com', 'COURSE-LMV-AUTO', instAmit, carI20,
      '2026-10-10', '09:00:00 - 10:00:00', 'Completed',
      'Day 3: Reversing into parking bay using guideway lines and side mirrors',
      '2026-10-05 14:00:00'
    );
    await logAttendance(b9, 'priya.sharma@student.com', instAmit, '2026-10-10', 'Present', 8.00,
      '90-degree bay parking, rear cross-traffic check, mirror alignment',
      5, 'Perfect centered parking between bay lines. Good reliance on physical mirrors alongside camera.',
      '2026-10-10 10:15:00'
    );

    // Session 4: Upcoming Scheduled Practical Session
    await createBooking(
      'priya.sharma@student.com', 'COURSE-LMV-AUTO', instAmit, carI20,
      '2026-10-27', '09:00:00 - 10:00:00', 'Scheduled',
      'Day 4: Highway driving and RTO qualifying exam track drill',
      '2026-10-22 12:00:00'
    );

    // --- STUDENT 3: Rohan Deepak Deshmukh (Combo MCWG + LMV) ---
    const b11 = await createBooking(
      'rohan.deshmukh@student.com', 'COURSE-COMBO', instSanjay, bikeActiva,
      '2026-09-22', '16:00:00 - 17:00:00', 'Completed',
      'Day 1: Two-wheeler slalom cone drills, slow speed balance, 8-figure track',
      '2026-09-19 10:00:00'
    );
    await logAttendance(b11, 'rohan.deshmukh@student.com', instSanjay, '2026-09-22', 'Present', 6.00,
      'Slow crawl speed balance, emergency rear-front brake proportioning, RTO 8 track',
      4, 'Passed the 8-track without foot touch. Maintained steady 10 km/h throttle control.',
      '2026-09-22 17:10:00'
    );

    const b12 = await createBooking(
      'rohan.deshmukh@student.com', 'COURSE-COMBO', instRajesh, carSwift,
      '2026-10-05', '16:00:00 - 17:00:00', 'Completed',
      'Day 2: Four-wheeler manual basics, clutch coordination, gear shifting',
      '2026-09-29 11:00:00'
    );
    await logAttendance(b12, 'rohan.deshmukh@student.com', instRajesh, '2026-10-05', 'Present', 10.50,
      'Clutch friction control, three-point turns, curb approach',
      4, 'Smooth transition from two-wheeler to car. Good spatial awareness.',
      '2026-10-05 17:15:00'
    );

    await createBooking(
      'rohan.deshmukh@student.com', 'COURSE-COMBO', instRajesh, carSwift,
      '2026-10-28', '16:00:00 - 17:00:00', 'Scheduled',
      'Day 3: Parallel parking and incline start assessment',
      '2026-10-23 15:00:00'
    );

    // --- STUDENT 4: Snehal Ramesh Patil (Two-Wheeler MCWG) ---
    const b14 = await createBooking(
      'snehal.patil@student.com', 'COURSE-MCWG', instSanjay, bikeActiva,
      '2026-09-30', '17:00:00 - 18:00:00', 'Completed',
      'Day 1: Scooter balance, hand signaling, helmet strap discipline',
      '2026-09-26 12:00:00'
    );
    await logAttendance(b14, 'snehal.patil@student.com', instSanjay, '2026-09-30', 'Present', 5.50,
      'Center of gravity, slow turns, front disc brake safety',
      4, 'Steady balance on slalom cones. Well disciplined with helmet and rearview mirror checks.',
      '2026-09-30 18:10:00'
    );

    await createBooking(
      'snehal.patil@student.com', 'COURSE-MCWG', instSanjay, bikeActiva,
      '2026-10-25', '17:00:00 - 18:00:00', 'Scheduled',
      'Day 2: Traffic road test and zebra crossing stopping drill',
      '2026-10-22 16:00:00'
    );

    // --- STUDENT 5: Aniket Vijay Kulkarni (FRESH ENROLLMENT - PENDING FINALIZATION) ---
    // (Notice: status is 'Pending', InstructorID is NULL, VehicleID is NULL so the Admin can test Finalize Slot!)
    await createBooking(
      'aniket.kulkarni@student.com', 'COURSE-LMV-MANUAL', null, null,
      '2026-10-27', '08:00:00 - 09:00:00', 'Pending',
      'Preferred slot: Morning Batch (08:00 AM - 09:00 AM). Enrolled in LMV-Manual. Awaiting Admin finalization.',
      '2026-10-20 12:30:00'
    );

    // --- STUDENT 6: Tanvi Mahesh Joshi (Automatic Learner) ---
    const b16 = await createBooking(
      'tanvi.joshi@student.com', 'COURSE-LMV-AUTO', instAmit, carI20,
      '2026-10-18', '16:00:00 - 17:00:00', 'Completed',
      'Day 1: Vehicle cockpit controls, accelerator pedal sensitivity, gradual stops',
      '2026-10-13 14:00:00'
    );
    await logAttendance(b16, 'tanvi.joshi@student.com', instAmit, '2026-10-18', 'Present', 6.80,
      'Accelerator touch, emergency braking test from 30 km/h, lane centering',
      4, 'Calm and steady driver. Reacted quickly to sudden stop signal.',
      '2026-10-18 17:15:00'
    );

    await createBooking(
      'tanvi.joshi@student.com', 'COURSE-LMV-AUTO', instAmit, carI20,
      '2026-10-29', '16:00:00 - 17:00:00', 'Scheduled',
      'Day 2: Reverse parking and ring road lane progression',
      '2026-10-23 10:00:00'
    );

    console.log('   ✓ 14 Sessions created (9 Completed with rich attendance logs, 4 Scheduled, 1 Pending Admin Slot Finalization)');

    // 9. Test Evaluations (Internal Mock Tests & Official RTO Schedules)
    console.log('9. Inserting RTO Mock Tests & Exam Schedules...');

    // Radheya: Passed Mock Quiz + Official RTO Test Scheduled
    await connection.query(
      `INSERT INTO TestScheduleMaster (StudentID, CourseID, TestType, TestDate, TestTime, ScoreObtained, TotalScore, ResultStatus, ExaminerOrInstructorNotes, CreatedAt)
       VALUES (?, ?, 'Theory_Mock_Quiz', '2026-09-18', '11:00:00', 92.00, 100.00, 'Passed', 'Scored 92% on Paper 1 (Traffic Signs) and Paper 2 (Right of Way). Mastered overtaking regulations.', '2026-09-18 11:45:00')`,
      [uMap['radheya.khandelwal@student.com'], cMap['COURSE-LMV-MANUAL'].id]
    );

    await connection.query(
      `INSERT INTO TestScheduleMaster (StudentID, CourseID, TestType, TestDate, TestTime, ScoreObtained, TotalScore, ResultStatus, ExaminerOrInstructorNotes, CreatedAt)
       VALUES (?, ?, 'Practical_Internal_Mock', '2026-10-18', '10:30:00', 88.00, 100.00, 'Passed', 'Internal H-Track evaluation completed with distinction. Zero penalties on gradient start.', '2026-10-18 11:30:00')`,
      [uMap['radheya.khandelwal@student.com'], cMap['COURSE-LMV-MANUAL'].id]
    );

    await connection.query(
      `INSERT INTO TestScheduleMaster (StudentID, CourseID, TestType, TestDate, TestTime, ScoreObtained, TotalScore, ResultStatus, ExaminerOrInstructorNotes, CreatedAt)
       VALUES (?, ?, 'Official_RTO_Test', '2026-11-10', '10:00:00', NULL, 100.00, 'Scheduled', 'Official RTO Latur Practical Driving Test scheduled at Babhalgaon Road RTO track.', '2026-10-20 14:00:00')`,
      [uMap['radheya.khandelwal@student.com'], cMap['COURSE-LMV-MANUAL'].id]
    );

    // Priya: Passed Mock Quiz + Official Test Scheduled
    await connection.query(
      `INSERT INTO TestScheduleMaster (StudentID, CourseID, TestType, TestDate, TestTime, ScoreObtained, TotalScore, ResultStatus, ExaminerOrInstructorNotes, CreatedAt)
       VALUES (?, ?, 'Theory_Mock_Quiz', '2026-10-05', '11:30:00', 84.00, 100.00, 'Passed', 'Good grasp of cautionary road signs, zebra crosswalk rules, and speed limits.', '2026-10-05 12:15:00')`,
      [uMap['priya.sharma@student.com'], cMap['COURSE-LMV-AUTO'].id]
    );

    await connection.query(
      `INSERT INTO TestScheduleMaster (StudentID, CourseID, TestType, TestDate, TestTime, ScoreObtained, TotalScore, ResultStatus, ExaminerOrInstructorNotes, CreatedAt)
       VALUES (?, ?, 'Official_RTO_Test', '2026-11-15', '11:00:00', NULL, 100.00, 'Scheduled', 'Official RTO Latur driving test scheduled for LMV-Automatic category.', '2026-10-22 15:00:00')`,
      [uMap['priya.sharma@student.com'], cMap['COURSE-LMV-AUTO'].id]
    );

    // Rohan: Passed Theory Mock Quiz
    await connection.query(
      `INSERT INTO TestScheduleMaster (StudentID, CourseID, TestType, TestDate, TestTime, ScoreObtained, TotalScore, ResultStatus, ExaminerOrInstructorNotes, CreatedAt)
       VALUES (?, ?, 'Theory_Mock_Quiz', '2026-10-12', '14:00:00', 88.00, 100.00, 'Passed', 'High score on MV Act penalties, helmet mandates, and dual-lane overtaking.', '2026-10-12 14:45:00')`,
      [uMap['rohan.deshmukh@student.com'], cMap['COURSE-COMBO'].id]
    );

    // Snehal: Passed Theory Mock Quiz
    await connection.query(
      `INSERT INTO TestScheduleMaster (StudentID, CourseID, TestType, TestDate, TestTime, ScoreObtained, TotalScore, ResultStatus, ExaminerOrInstructorNotes, CreatedAt)
       VALUES (?, ?, 'Theory_Mock_Quiz', '2026-10-08', '15:00:00', 80.00, 100.00, 'Passed', 'Passed two-wheeler theory test. Recommended extra caution at uncontrolled intersections.', '2026-10-08 15:40:00')`,
      [uMap['snehal.patil@student.com'], cMap['COURSE-MCWG'].id]
    );

    console.log('   ✓ 7 Exam records created (5 Passed mock exams with ratings + 2 Official RTO Tests scheduled for November 2026)');

    console.log('\n=============================================================');
    console.log(' DATABASE SEEDED SUCCESSFULLY WITH ESTABLISHED HISTORY ');
    console.log('=============================================================');

    process.exit(0);
  } catch (err) {
    console.error('Seeding rich history failed:', err);
    process.exit(1);
  } finally {
    connection.release();
  }
}

seedRichHistory();
