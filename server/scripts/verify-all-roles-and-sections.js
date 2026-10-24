const API_URL = 'https://driving-school-management-system-c33z.onrender.com/api';

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  
  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    return data;
  }
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  return res;
}

async function runVerification() {
  console.log('================================================================');
  console.log(' DRIVING SCHOOL MANAGEMENT SYSTEM: LIVE PRODUCTION AUDIT');
  console.log(` Target API: ${API_URL}`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // SECTION 1: SYSTEM HEALTH & TI DB CLUSTER
    // -------------------------------------------------------------
    console.log('--- 1. Testing System Health & TiDB Cloud Connection ---');
    const health = await request('/health');
    assert(health.status === 'UP', 'API Status is UP');
    assert(health.database.includes('TiDB Cloud'), 'Connected to TiDB Cloud MySQL');

    // -------------------------------------------------------------
    // SECTION 2: ROLE 1 - CHIEF ADMINISTRATOR
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Role: Administrator (admin@drivingschool.com) ---');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@drivingschool.com', password: 'Admin@123' })
    });
    assert(adminLogin.success && adminLogin.token, 'Admin authenticated successfully');
    const adminToken = adminLogin.token;
    const adminHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    };

    // 2.1 Dashboard Stats
    const stats = await request('/reports/dashboard-stats', { headers: adminHeaders });
    assert(stats.success && stats.stats.totalStudents !== undefined, 'Admin dashboard metrics retrieved');
    console.log(`         Students: ${stats.stats.totalStudents}, Instructors: ${stats.stats.totalInstructors}, Revenue: Rs. ${stats.stats.totalRevenue}`);

    // 2.2 Excel Exports with Auth Header
    const studentExcelRes = await request('/reports/export/students-excel', { headers: adminHeaders });
    assert(studentExcelRes.status === 200, 'Student Roster Excel report (.xlsx) generated');
    const revenueExcelRes = await request('/reports/export/revenue-excel', { headers: adminHeaders });
    assert(revenueExcelRes.status === 200, 'Fee Collections Excel report (.xlsx) generated');

    // 2.3 Instructor Management & Salary Check
    const instructors = await request('/instructors', { headers: adminHeaders });
    assert(instructors.success && instructors.count > 0, `Instructors listed (Count: ${instructors.count})`);
    const inst1 = instructors.instructors[0];
    assert(inst1.Salary !== undefined && parseFloat(inst1.Salary) > 0, `Instructor Salary present (Rs. ${inst1.Salary}/mo for ${inst1.FullName})`);

    // 2.4 Student Directory & 360-Degree Profile
    const users = await request('/auth/users?role=Student', { headers: adminHeaders });
    assert(users.success && users.count > 0, `Student directory listed (${users.count} students)`);
    const sampleStudent = users.users[0];
    const student360 = await request(`/auth/users/${sampleStudent.UserID}/details`, { headers: adminHeaders });
    assert(student360.success && student360.student.summary, `Student 360 profile loaded for ${sampleStudent.FullName}`);
    assert(Array.isArray(student360.student.bookings) && Array.isArray(student360.student.payments), '360 Profile contains bookings and payment ledger');

    // 2.5 Admin Date-Only Test Scheduling
    const scheduleRes = await request('/tests', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        studentId: sampleStudent.UserID,
        courseId: 2,
        testType: 'Official_RTO_Test',
        testDate: '2026-10-30',
        examinerNotes: 'Assigned by Date for Parivahan License Evaluation'
      })
    });
    assert(scheduleRes.success, 'Admin assigned official test strictly by date (no time conflict)');

    // -------------------------------------------------------------
    // SECTION 3: ROLE 2 - CERTIFIED INSTRUCTOR
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Role: Instructor (rajesh.patil@drivingschool.com) ---');
    const instLogin = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rajesh.patil@drivingschool.com', password: 'Instructor@123' })
    });
    assert(instLogin.success && instLogin.token, 'Instructor authenticated successfully');
    const instToken = instLogin.token;
    const instAuthHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${instToken}`
    };

    // 3.1 Instructor Sessions & Profile
    const instProfile = await request('/auth/profile', { headers: instAuthHeaders });
    assert(instProfile.success && instProfile.profile.Role === 'Instructor', 'Instructor profile role confirmed');

    const instBookings = await request('/bookings', { headers: instAuthHeaders });
    assert(instBookings.success, `Instructor assigned sessions retrieved (Count: ${instBookings.count})`);

    // 3.2 Lesson Attendance Recording
    const attendanceList = await request('/attendance', { headers: instAuthHeaders });
    assert(attendanceList.success, `Lesson attendance logs retrieved (Count: ${attendanceList.count})`);

    // -------------------------------------------------------------
    // SECTION 4: ROLE 3 - STUDENT LEARNER
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Role: Student (radheya.khandelwal@student.com) ---');
    const studentLogin = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'radheya.khandelwal@student.com', password: 'Student@123' })
    });
    assert(studentLogin.success && studentLogin.token, 'Student authenticated successfully');
    const studentToken = studentLogin.token;
    const studentAuthHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    };

    // 4.1 Courses & Full Payment
    const courses = await request('/courses', { headers: studentAuthHeaders });
    assert(courses.success && courses.count >= 4, `Course catalog verified (${courses.count} courses available)`);

    // 4.2 PDF Receipt Download with Auth
    const payments = await request('/payments', { headers: studentAuthHeaders });
    assert(payments.success && payments.count > 0, `Student payment records found (${payments.count} invoices)`);
    const p1 = payments.payments[0];
    const pdfRes = await request(`/payments/${p1.PaymentID}/receipt`, { headers: studentAuthHeaders });
    assert(pdfRes.status === 200, `Official PDF receipt downloaded for Invoice ${p1.InvoiceNumber}`);
    const pdfBlob = await pdfRes.arrayBuffer();
    const pdfHeader = Buffer.from(pdfBlob).slice(0, 4).toString('utf-8');
    assert(pdfHeader === '%PDF', 'PDF file format verified (%PDF header intact)');

    // 4.3 6 RTO Question Papers
    const papersRes = await request('/tests/mock-quiz/papers', { headers: studentAuthHeaders });
    assert(papersRes.success && papersRes.papers.length === 6, 'All 6 distinct RTO question papers loaded');
    console.log(`         Paper 1: ${papersRes.papers[0].title}`);
    console.log(`         Paper 6: ${papersRes.papers[5].title}`);

    // 4.4 Fetch Paper Questions & Submit Answers
    const paperQuestions = await request('/tests/mock-quiz/questions?paperId=2', { headers: studentAuthHeaders });
    assert(paperQuestions.success && paperQuestions.count === 8, 'Paper 2 (Right of Way) loaded 8 questions');

    const sampleAnswers = paperQuestions.questions.map(q => ({
      questionId: q.id,
      selectedOption: 0
    }));

    const quizResult = await request('/tests/mock-quiz/submit', {
      method: 'POST',
      headers: studentAuthHeaders,
      body: JSON.stringify({
        courseId: 2,
        paperId: 2,
        answers: sampleAnswers
      })
    });
    assert(quizResult.success && quizResult.score !== undefined, `Mock test graded successfully (Score: ${quizResult.score}%, Result: ${quizResult.resultStatus})`);
    assert(Array.isArray(quizResult.review) && quizResult.review.length === 8, 'Detailed review and explanations generated for student');

    // 4.5 Student Bookings & Schedules
    const studentBookings = await request('/bookings', { headers: studentAuthHeaders });
    assert(studentBookings.success, `Student active schedules retrieved (Count: ${studentBookings.count})`);

    // 4.6 Student Test Schedule View
    const studentTests = await request('/tests', { headers: studentAuthHeaders });
    assert(studentTests.success && studentTests.count > 0, `Student test records retrieved (Count: ${studentTests.count})`);

  } catch (err) {
    console.error('\n[EXCEPTION ENCOUNTERED]', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(` FINAL VERIFICATION RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification();
