const pool = require('../config/db');

// 6 Distinct RTO Question Papers
const RTO_PAPERS = {
  1: {
    paperId: 1,
    title: 'Paper 1: Traffic Signs, Signals & Road Markings',
    description: 'Mandatory signs, cautionary signals, and road surface markings.',
    questions: [
      {
        id: 101,
        question: 'What is the mandatory action when approaching an uncontrolled pedestrian zebra crossing?',
        options: [
          'Honk loudly and maintain high speed',
          'Slow down and give precedence to pedestrians wanting to cross',
          'Accelerate before pedestrians step onto the crossing',
          'Ignore pedestrians if driving a four-wheeler'
        ],
        correctAnswer: 1,
        explanation: 'Under Motor Vehicle Rules, drivers must slow down and give way to pedestrians at zebra crossings.'
      },
      {
        id: 102,
        question: 'What does a solid continuous single or double white line on the center of a two-way road mean?',
        options: [
          'Lane changing and overtaking is strictly prohibited',
          'Overtaking is permitted anytime safely',
          'Parking allowed on the centerline',
          'Designated bicycle corridor'
        ],
        correctAnswer: 0,
        explanation: 'A solid unbroken center line means you must stay strictly in your lane and cannot cross to overtake.'
      },
      {
        id: 103,
        question: 'An inverted equilateral triangular road sign with a red border signifies:',
        options: ['Stop', 'Give Way / Yield', 'No Entry', 'Speed Limit 50 km/h'],
        correctAnswer: 1,
        explanation: 'An inverted triangle with red border universally indicates "Give Way" to cross traffic.'
      },
      {
        id: 104,
        question: 'What does a flashing amber (yellow) traffic signal at an intersection indicate?',
        options: [
          'Come to a complete dead stop until green',
          'Slow down and proceed with extreme caution after checking cross traffic',
          'Speed up to clear the intersection quickly',
          'The intersection is closed for roadwork'
        ],
        correctAnswer: 1,
        explanation: 'Flashing amber means slow down, look both directions, and proceed only when clear.'
      },
      {
        id: 105,
        question: 'What does an octagonal (8-sided) red traffic sign indicate?',
        options: ['No Parking', 'Speed Limit', 'Stop', 'Hospital Ahead'],
        correctAnswer: 2,
        explanation: 'The octagonal shape is reserved exclusively for STOP signs so it is identifiable even from the back.'
      },
      {
        id: 106,
        question: 'A circular sign showing a blue background with a white arrow pointing straight ahead means:',
        options: ['Compulsory ahead only', 'One-way street ending', 'Speed limit 60', 'No entry for heavy vehicles'],
        correctAnswer: 0,
        explanation: 'Blue circular signs represent mandatory regulatory directions.'
      },
      {
        id: 107,
        question: 'What is the significance of yellow zig-zag lines painted on the roadside near school gates?',
        options: [
          'Loading and unloading parking zone',
          'Strictly no stopping, waiting, or parking at any time',
          'Designated school bus pickup stand',
          'Free 15-minute visitor parking'
        ],
        correctAnswer: 1,
        explanation: 'Yellow zig-zag markings near schools and crossings indicate strict no stopping or parking.'
      },
      {
        id: 108,
        question: 'When a traffic light turns green, what should you verify before moving forward?',
        options: [
          'Immediately accelerate with maximum throttle',
          'Ensure the intersection is clear of pedestrians and turning vehicles before proceeding',
          'Sound your horn to alert vehicles behind you',
          'Turn on hazard blinkers'
        ],
        correctAnswer: 1,
        explanation: 'Green means proceed only when safe; drivers must ensure the junction is clear of stragglers.'
      }
    ]
  },

  2: {
    paperId: 2,
    title: 'Paper 2: Right of Way, Overtaking & Lane Rules',
    description: 'Roundabout priority, overtaking on hills, lane discipline, and intersection navigation.',
    questions: [
      {
        id: 201,
        question: 'When overtaking another moving vehicle on a standard Indian road, you must overtake:',
        options: [
          'Only from the right side of the vehicle ahead',
          'Only from the left side using the shoulder',
          'From whichever side has more gap',
          'Over the pedestrian footpath'
        ],
        correctAnswer: 0,
        explanation: 'In India (drive on left), overtaking must always be done on the right of the overtaken vehicle.'
      },
      {
        id: 202,
        question: 'On a steep mountain incline or hill slope, who has the primary right of way?',
        options: [
          'The vehicle traveling downhill because gravity gives higher momentum',
          'The vehicle traveling uphill because stopping and restarting on a slope is hazardous',
          'Whichever vehicle sounds its horn first',
          'The heavier commercial truck'
        ],
        correctAnswer: 1,
        explanation: 'Vehicles ascending a slope have right of way over descending vehicles.'
      },
      {
        id: 203,
        question: 'When approaching an uncontrolled circular roundabout in India, you must give way to:',
        options: [
          'Traffic approaching from your left outside the roundabout',
          'Traffic already circulating within the roundabout approaching from your right',
          'Vehicles following directly behind you',
          'No one; first vehicle to reach entry has priority'
        ],
        correctAnswer: 1,
        explanation: 'Vehicles entering a roundabout must yield to traffic already circulating from the right.'
      },
      {
        id: 204,
        question: 'In which of the following situations is overtaking strictly prohibited?',
        options: [
          'On bridges, blind corners, crests of hills, and near pedestrian crossings',
          'On a 4-lane divided national expressway',
          'When the vehicle in front is moving below 30 km/h',
          'During daylight hours on wide roads'
        ],
        correctAnswer: 0,
        explanation: 'Overtaking is forbidden near blind turns, bridges, crests, and pedestrian zones due to zero visibility.'
      },
      {
        id: 205,
        question: 'Before changing lanes on a multi-lane highway, the correct sequence of actions is:',
        options: [
          'Turn steering wheel, check mirror, signal',
          'Mirror check, Blind-spot shoulder check, Indicator signal, smooth maneuver',
          'Sound horn and change immediately',
          'Accelerate to maximum speed without looking'
        ],
        correctAnswer: 1,
        explanation: 'The standard defensive driving rule is MSM (Mirror, Signal, Maneuver) plus blind spot check.'
      },
      {
        id: 206,
        question: 'Under what circumstance is it permissible to overtake a vehicle on its left side?',
        options: [
          'When the driver ahead has signaled their intention to turn right and moved to the center',
          'When the road is congested and the left shoulder is empty',
          'When the vehicle ahead is an auto-rickshaw',
          'It is never permitted under any circumstance'
        ],
        correctAnswer: 0,
        explanation: 'Left-side overtaking is only legal when the preceding vehicle is clearly positioned and signaling to turn right.'
      },
      {
        id: 207,
        question: 'At an uncontrolled intersection where two roads cross with no signals or signs, who has priority?',
        options: [
          'The vehicle arriving from your right side',
          'The vehicle arriving from your left side',
          'The fastest accelerating vehicle',
          'The larger commercial vehicle'
        ],
        correctAnswer: 0,
        explanation: 'The primary rule at uncontrolled crossings is to give way to traffic coming from your right.'
      },
      {
        id: 208,
        question: 'What is the correct action when an emergency ambulance or fire engine approaches with siren activated?',
        options: [
          'Speed up to guide the emergency vehicle',
          'Immediately steer to the left side of the roadway and stop to provide unobstructed path',
          'Stop dead in your current lane immediately',
          'Turn on your music system'
        ],
        correctAnswer: 1,
        explanation: 'Motor Vehicle Act mandates all drivers to draw to the edge of the road and give clear passage.'
      }
    ]
  },

  3: {
    paperId: 3,
    title: 'Paper 3: Vehicle Controls, Dashboard Indicators & Mechanics',
    description: 'Dashboard warning lights, pedals, transmission, clutch friction point, and vehicle safety checks.',
    questions: [
      {
        id: 301,
        question: 'What does a red battery/alternator icon glowing on the instrument cluster while engine is running mean?',
        options: [
          'Battery is fully charged to 100%',
          'Charging system failure; alternator is not supplying electricity',
          'Key fob battery needs replacement',
          'Air conditioning system is off'
        ],
        correctAnswer: 1,
        explanation: 'A red battery light while running means the charging system/alternator is faulty and battery will drain.'
      },
      {
        id: 302,
        question: 'What is meant by the "clutch bite/friction point" in a manual transmission car?',
        options: [
          'The clutch pedal is pressed completely down to the carpet floor',
          'The exact point where clutch plates begin engaging and engine power transmits to wheels',
          'The brake pedal is depressed fully',
          'The point where the engine overheats'
        ],
        correctAnswer: 1,
        explanation: 'The biting point is where flywheel and clutch disc touch, initiating vehicle forward movement.'
      },
      {
        id: 303,
        question: 'When should hazard warning lights (dual flashing blinkers) be used?',
        options: [
          'When driving fast during heavy rain',
          'When your vehicle is stationary and causing a temporary obstruction due to breakdown',
          'When driving straight through a crossroad intersection',
          'When parking in an official designated parking lot'
        ],
        correctAnswer: 1,
        explanation: 'Hazard lights are intended to warn others of a stationary broken-down vehicle or urgent hazard ahead.'
      },
      {
        id: 304,
        question: 'What does an illuminated exclamation mark inside a circle or parentheses (!)-icon in red signify?',
        options: [
          'Low washer fluid',
          'Handbrake is engaged or hydraulic brake fluid level is critically low',
          'Engine oil is overfilled',
          'High beam headlamps are on'
        ],
        correctAnswer: 1,
        explanation: 'The red (!) symbol indicates either the handbrake is up or brake hydraulic pressure/fluid is dangerous.'
      },
      {
        id: 305,
        question: 'What is the danger of constantly resting your left foot on the clutch pedal ("riding the clutch") while driving?',
        options: [
          'It increases engine horsepower',
          'It causes premature wear and overheating of the clutch release bearing and friction plate',
          'It saves brake pads',
          'It improves fuel mileage'
        ],
        correctAnswer: 1,
        explanation: 'Riding the clutch causes continuous friction, slippage, and early burnout of the clutch assembly.'
      },
      {
        id: 306,
        question: 'When driving downhill on a steep gradient, how should you control vehicle speed to avoid brake fade?',
        options: [
          'Shift into neutral and rely purely on continuous footbrake pressure',
          'Shift into a lower gear to utilize engine braking, supplemented by gentle brake pulses',
          'Switch off the ignition key',
          'Keep clutch pedal depressed continuously'
        ],
        correctAnswer: 1,
        explanation: 'Engine braking in lower gears prevents brake discs from overheating and losing stopping power.'
      },
      {
        id: 307,
        question: 'Why is driving with under-inflated tyres considered dangerous?',
        options: [
          'It makes the car accelerate too fast',
          'It causes excessive sidewall flexing, tyre overheating, poor braking, and risk of blowout',
          'It makes steering excessively light',
          'It causes spark plug failure'
        ],
        correctAnswer: 1,
        explanation: 'Low tyre pressure causes heat buildup, higher fuel consumption, and catastrophic tyre blowouts.'
      },
      {
        id: 308,
        question: 'In a modern ABS (Anti-lock Braking System) equipped vehicle during emergency panic braking, you should:',
        options: [
          'Pump the brake pedal rapidly up and down manually',
          'Press the brake pedal down firmly and maintain continuous hard pressure while steering to safety',
          'Yank the handbrake immediately',
          'Shift immediately into reverse gear'
        ],
        correctAnswer: 1,
        explanation: 'ABS automatically pulses brakes hundreds of times per minute. The driver must stomp, stay on, and steer.'
      }
    ]
  },

  4: {
    paperId: 4,
    title: 'Paper 4: Emergency Situations, Braking & Defensive Driving',
    description: 'Aquaplaning, sudden tyre puncture, night glare, following distance, and accident prevention.',
    questions: [
      {
        id: 401,
        question: 'What is "aquaplaning" or "hydroplaning" while driving on wet rain-soaked highways?',
        options: [
          'The car turns into an amphibious boat',
          'Tyres lose physical contact with the tarmac and ride on a film of water, causing loss of steering and braking',
          'Engine water cooling system activates',
          'Windshield wipers wiping too fast'
        ],
        correctAnswer: 1,
        explanation: 'Aquaplaning occurs when water builds up between tyres and road, removing all traction and steering control.'
      },
      {
        id: 402,
        question: 'If your front tyre blows out suddenly at 70 km/h, what is the safest immediate reaction?',
        options: [
          'Slam on the footbrake with maximum force immediately',
          'Grip the steering wheel firmly with both hands, ease off the accelerator, and gently brake once stable',
          'Pull the handbrake abruptly to the top notch',
          'Turn the steering wheel sharply towards the divider'
        ],
        correctAnswer: 1,
        explanation: 'Abrupt braking during a front blowout causes severe spinout. Maintain steering and ease off throttle.'
      },
      {
        id: 403,
        question: 'What is the standard "Two-Second Rule" used for in defensive driving?',
        options: [
          'Time to glance at your phone screen while driving',
          'Minimum safe following distance behind the vehicle ahead in dry, normal conditions',
          'Duration of sounding the horn',
          'Time required to start the engine'
        ],
        correctAnswer: 1,
        explanation: 'The 2-second rule ensures you have adequate reaction and braking buffer behind the preceding car.'
      },
      {
        id: 404,
        question: 'When driving at night, what should you do if an oncoming vehicle does not dip its high beams?',
        options: [
          'Stare directly into the oncoming headlights to see their driver',
          'Slow down, look towards the left edge or white fog line of your lane, and avoid looking into the glare',
          'Switch your high beams on and close your eyes',
          'Drive in the middle of the road'
        ],
        correctAnswer: 1,
        explanation: 'Focusing on the left shoulder marking guides your vehicle safely past high-beam glare without blinding you.'
      },
      {
        id: 405,
        question: 'If your vehicle’s accelerator pedal gets stuck down while traveling on a road, what should you do first?',
        options: [
          'Depress the clutch pedal (or shift to Neutral in automatic), apply firm brakes, and steer to the roadside',
          'Switch off the engine and pull out the ignition key while moving at speed',
          'Jump out of the vehicle',
          'Turn on the radio'
        ],
        correctAnswer: 0,
        explanation: 'Shifting to Neutral disengages engine power from wheels, allowing brakes to safely stop the vehicle.'
      },
      {
        id: 406,
        question: 'What is the danger of removing the radiator cap when the engine is boiling hot?',
        options: [
          'It will drain the vehicle battery',
          'Pressurized scalding steam and boiling coolant will erupt explosively, causing catastrophic burns',
          'It damages the car paint',
          'The air conditioning filter will clog'
        ],
        correctAnswer: 1,
        explanation: 'Cooling systems operate under high pressure. Never open a hot radiator cap.'
      },
      {
        id: 407,
        question: 'In dense fog conditions during winter mornings, which lights should be illuminated?',
        options: [
          'High beam headlights',
          'Low beam headlights and dedicated front/rear fog lamps',
          'Hazard flashers only while speeding',
          'Interior roof lamp only'
        ],
        correctAnswer: 1,
        explanation: 'High beams reflect off fog water droplets, causing blinding glare. Low beams with fog lights illuminate the road.'
      },
      {
        id: 408,
        question: 'What is "blind spot" in driving terminology?',
        options: [
          'An area around your vehicle that cannot be seen directly in rear-view or side-view mirrors',
          'A tunnel with no electric lighting',
          'A windshield covered in dirt',
          'When driver forgets their spectacles'
        ],
        correctAnswer: 0,
        explanation: 'Blind spots are zones over your shoulders obscured by car pillars not covered by mirrors.'
      }
    ]
  },

  5: {
    paperId: 5,
    title: 'Paper 5: Motor Vehicle Act, Penalties, Documents & LLR Rules',
    description: 'Mandatory vehicle documents, LLR validity, drunk driving laws, speed limits, and RTO regulations.',
    questions: [
      {
        id: 501,
        question: 'What is the maximum legal validity of an RTO Learner’s License (LLR) in India?',
        options: ['30 days', '6 months (180 days)', '1 year', '5 years'],
        correctAnswer: 1,
        explanation: 'An LLR issued by RTO is valid across India for 6 months from the date of issue.'
      },
      {
        id: 502,
        question: 'While driving on public roads holding a Learner’s License (LLR), what is legally mandatory?',
        options: [
          'You may drive alone provided you maintain under 40 km/h',
          'An "L" plate displayed prominently on front/rear and accompanied by a person holding a valid permanent driving license',
          'No passenger is allowed inside the car',
          'Driving is only allowed between 12:00 PM and 2:00 PM'
        ],
        correctAnswer: 1,
        explanation: 'Rule 3 of Central Motor Vehicles Rules mandates red "L" plates and an instructor or licensed driver beside you.'
      },
      {
        id: 503,
        question: 'Which set of documents must always be available when driving a motor vehicle on public roads?',
        options: [
          'Driving License, Registration Certificate (RC), Valid Insurance, and Pollution Under Control (PUC) Certificate',
          'College ID card and electricity bill',
          'Only vehicle purchase invoice',
          'Aadhar card only'
        ],
        correctAnswer: 0,
        explanation: 'Section 130 of MV Act requires DL, RC, Insurance, and PUC (physical or via DigiLocker/mParivahan).'
      },
      {
        id: 504,
        question: 'Under Section 185 of the Motor Vehicle Act, what is the legal blood alcohol limit for drivers in India?',
        options: [
          '30 mg per 100 ml of blood detected by a breath analyzer test',
          '100 mg per 100 ml of blood',
          '50 mg per 100 ml of blood',
          'Any amount is legal if driving slowly'
        ],
        correctAnswer: 0,
        explanation: 'The legal threshold is 30 mg per 100 ml; exceeding this leads to imprisonment, fine, and license suspension.'
      },
      {
        id: 505,
        question: 'What is the mandatory minimum age for obtaining a permanent Driving License for a Light Motor Vehicle (Car)?',
        options: ['16 years', '18 years', '21 years', '25 years'],
        correctAnswer: 1,
        explanation: 'Under Section 4 of MV Act, minimum age for private car license is 18 years.'
      },
      {
        id: 506,
        question: 'What is the penalty for driving a motor vehicle without a valid third-party insurance policy?',
        options: [
          'Fine of ₹2,000 and/or imprisonment up to 3 months for first offense',
          'A verbal warning only',
          '₹50 penalty',
          'No penalty if driving in your own town'
        ],
        correctAnswer: 0,
        explanation: 'Uninsured driving carries a fine of ₹2,000 (₹4,000 for repeat) and/or 3 months imprisonment.'
      },
      {
        id: 507,
        question: 'Wearing a certified helmet while riding a two-wheeler is legally mandatory for:',
        options: [
          'Only the driver riding the motorcycle',
          'Both the driver and the pillion passenger (above 4 years old)',
          'Only on national highways, not in city streets',
          'Only during night hours'
        ],
        correctAnswer: 1,
        explanation: 'Section 129 of MV Act mandates BIS-standard helmets for both rider and pillion passenger.'
      },
      {
        id: 508,
        question: 'What is the default general speed limit near schools and hospitals unless indicated otherwise?',
        options: ['25 km/h', '60 km/h', '80 km/h', '40 km/h'],
        correctAnswer: 0,
        explanation: 'Speed limit in designated school and hospital zones is restricted to 25 km/h for child pedestrian safety.'
      }
    ]
  },

  6: {
    paperId: 6,
    title: 'Paper 6: Comprehensive RTO Final Qualifying Exam',
    description: 'Master qualifying assessment combining signs, mechanics, road priority, and licensing laws.',
    questions: [
      {
        id: 601,
        question: 'A vehicle with hazard lights activated is driving down a highway at speed. What does this mean?',
        options: [
          'Correct usage during heavy rain',
          'Improper and confusing usage; hazard lights should only be used when vehicle is stopped or hazardous',
          'Vehicle is carrying VIP passenger',
          'Vehicle is speeding legally'
        ],
        correctAnswer: 1,
        explanation: 'Driving with hazards active disables turn signals and confuses drivers following behind.'
      },
      {
        id: 602,
        question: 'When parking on a steep uphill slope alongside a raised curb, your front wheels should be turned:',
        options: [
          'Away from the curb (towards the street)',
          'Parallel to the curb',
          'Towards the curb (left)',
          'Direction does not matter if handbrake is on'
        ],
        correctAnswer: 0,
        explanation: 'Turning wheels away from the curb ensures the back of front tyre catches the curb if brakes fail.'
      },
      {
        id: 603,
        question: 'What does a circular sign with a red border containing the numeral "50" inside signify?',
        options: [
          'Minimum compulsory speed is 50 km/h',
          'Maximum legal speed limit is 50 km/h',
          'Distance to next city is 50 km',
          'Highway route number 50'
        ],
        correctAnswer: 1,
        explanation: 'Red circular signs are prohibitive; numbers inside denote the maximum legal speed limit.'
      },
      {
        id: 604,
        question: 'What is the minimum safe distance you should maintain when stopping behind a car on an incline?',
        options: [
          'Touch bumpers to prevent rollback',
          'At least one car length or enough to clearly see the rear tyres touching the tarmac',
          '10 centimeters',
          'None, stay right against the boot'
        ],
        correctAnswer: 1,
        explanation: 'Leaving space to see rear tyres ensures safety if the front car rolls back slightly when starting.'
      },
      {
        id: 605,
        question: 'Under what medical conditions must a driver immediately cease operating a motor vehicle?',
        options: [
          'Epileptic seizures or uncorrected severe visual impairment',
          'Mild headache',
          'Common cold',
          'Mild muscle soreness'
        ],
        correctAnswer: 0,
        explanation: 'Conditions causing sudden loss of consciousness or vision render driving strictly illegal and dangerous.'
      },
      {
        id: 606,
        question: 'What does a broken white line along the center of the road permit?',
        options: [
          'Overtaking and lane changes are permitted when road ahead is clear and safe',
          'U-turns prohibited everywhere',
          'Parking on center line permitted',
          'Bus stop only'
        ],
        correctAnswer: 0,
        explanation: 'Broken lines permit crossing for overtaking or turning when safe to do so.'
      },
      {
        id: 607,
        question: 'Which gear provides the highest torque output in a manual motor vehicle?',
        options: ['1st Gear', '4th Gear', '5th Gear', 'Overdrive'],
        correctAnswer: 0,
        explanation: '1st gear provides maximum gear reduction, delivering maximum rotational torque to climb and start.'
      },
      {
        id: 608,
        question: 'After driving through deep flooded water, what immediate action should a driver take?',
        options: [
          'Drive at maximum speed immediately',
          'Gently test and tap the footbrake several times to dry out brake pads/discs with friction heat',
          'Apply the handbrake fully',
          'Switch off the headlights'
        ],
        correctAnswer: 1,
        explanation: 'Wet brake friction linings slip; light pulsing generates heat to evaporate trapped water.'
      }
    ]
  }
};

exports.getPapersList = (req, res) => {
  const papers = Object.values(RTO_PAPERS).map(p => ({
    paperId: p.paperId,
    title: p.title,
    description: p.description,
    questionCount: p.questions.length,
    passingScore: 60
  }));
  res.json({ success: true, papers });
};

exports.getMockQuizQuestions = (req, res) => {
  const paperIdParam = req.query.paperId;
  let targetPaperId = parseInt(paperIdParam, 10);

  if (!targetPaperId || !RTO_PAPERS[targetPaperId]) {
    // Pick random paper if not specified or invalid
    const paperKeys = Object.keys(RTO_PAPERS);
    targetPaperId = parseInt(paperKeys[Math.floor(Math.random() * paperKeys.length)], 10);
  }

  const paper = RTO_PAPERS[targetPaperId];
  const questionsForStudent = paper.questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));

  res.json({
    success: true,
    paperId: paper.paperId,
    paperTitle: paper.title,
    paperDescription: paper.description,
    count: questionsForStudent.length,
    questions: questionsForStudent
  });
};

exports.submitMockQuiz = async (req, res) => {
  try {
    const { studentId, courseId, answers, paperId } = req.body;
    const finalStudentId = req.user.role === 'Student' ? req.user.userId : studentId;

    if (!finalStudentId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Student ID and answers array are required.' });
    }

    const targetPaper = RTO_PAPERS[paperId] || RTO_PAPERS[1];
    let correctCount = 0;
    const review = [];

    targetPaper.questions.forEach(q => {
      const studentAns = answers.find(a => a.questionId === q.id);
      const isCorrect = studentAns && studentAns.selectedOption === q.correctAnswer;
      if (isCorrect) correctCount++;
      review.push({
        questionId: q.id,
        question: q.question,
        selectedOption: studentAns ? studentAns.selectedOption : null,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation
      });
    });

    const scorePercentage = Math.round((correctCount / targetPaper.questions.length) * 100);
    const resultStatus = scorePercentage >= 60 ? 'Passed' : 'Failed';
    const today = new Date().toISOString().slice(0, 10);

    // If student has an existing scheduled test for today or pending, update it or insert record
    const [result] = await pool.query(
      `INSERT INTO TestScheduleMaster (StudentID, CourseID, TestType, TestDate, TestTime, ScoreObtained, TotalScore, ResultStatus, ExaminerOrInstructorNotes)
       VALUES (?, COALESCE(?, 1), 'Theory_Mock_Quiz', ?, CURRENT_TIME(), ?, 100.00, ?, ?)`,
      [
        finalStudentId,
        courseId || null,
        today,
        scorePercentage,
        resultStatus,
        `${targetPaper.title}: ${correctCount}/${targetPaper.questions.length} correct (${scorePercentage}%).`
      ]
    );

    res.status(201).json({
      success: true,
      message: `Mock Test Completed! Score: ${scorePercentage}% (${resultStatus})`,
      testId: result.insertId,
      paperId: targetPaper.paperId,
      paperTitle: targetPaper.title,
      score: scorePercentage,
      resultStatus,
      review
    });
  } catch (error) {
    console.error('submitMockQuiz error:', error);
    res.status(500).json({ success: false, message: 'Server error processing mock test submission.' });
  }
};

exports.getAllTests = async (req, res) => {
  try {
    const { studentId, testType, resultStatus } = req.query;
    let query = `
      SELECT t.TestID, t.StudentID, u.FullName AS StudentName, u.Email AS StudentEmail, u.Phone AS StudentPhone, u.LLRNumber,
             t.CourseID, c.CourseName, c.Category AS CourseCategory,
             t.TestType, t.TestDate, t.TestTime, t.ScoreObtained, t.TotalScore, t.ResultStatus,
             t.ExaminerOrInstructorNotes, t.CreatedAt
      FROM TestScheduleMaster t
      JOIN UserMaster u ON t.StudentID = u.UserID
      LEFT JOIN CourseMaster c ON t.CourseID = c.CourseID
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'Student') {
      query += ` AND t.StudentID = ?`;
      params.push(req.user.userId);
    } else if (studentId) {
      query += ` AND t.StudentID = ?`;
      params.push(studentId);
    }

    if (testType) {
      query += ` AND t.TestType = ?`;
      params.push(testType);
    }
    if (resultStatus) {
      query += ` AND t.ResultStatus = ?`;
      params.push(resultStatus);
    }

    query += ` ORDER BY t.TestDate DESC, t.CreatedAt DESC`;
    const [tests] = await pool.query(query, params);
    res.json({ success: true, count: tests.length, tests });
  } catch (error) {
    console.error('getAllTests error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving test schedules.' });
  }
};

exports.scheduleTest = async (req, res) => {
  try {
    const { studentId, courseId, testType, testDate, testTime, examinerNotes } = req.body;

    if (!studentId || !testType || !testDate) {
      return res.status(400).json({ success: false, message: 'Student ID, Test Type, and Scheduled Date are required.' });
    }

    // Notice: Date is strictly assigned without forcing strict time synchronization
    const [result] = await pool.query(
      `INSERT INTO TestScheduleMaster (StudentID, CourseID, TestType, TestDate, TestTime, ResultStatus, ExaminerOrInstructorNotes)
       VALUES (?, ?, ?, ?, ?, 'Scheduled', ?)`,
      [studentId, courseId || 1, testType, testDate, testTime || '09:00:00', examinerNotes || 'Official RTO evaluation assigned for this date.']
    );

    res.status(201).json({
      success: true,
      message: `Test scheduled for student on ${testDate}. Student can attempt test on this designated date.`,
      testId: result.insertId
    });
  } catch (error) {
    console.error('scheduleTest error:', error);
    res.status(500).json({ success: false, message: 'Server error scheduling test.' });
  }
};

exports.updateTestResult = async (req, res) => {
  try {
    const { scoreObtained, resultStatus, examinerNotes } = req.body;
    await pool.query(
      `UPDATE TestScheduleMaster SET ScoreObtained = ?,
                                     ResultStatus = ?,
                                     ExaminerOrInstructorNotes = COALESCE(?, ExaminerOrInstructorNotes)
       WHERE TestID = ?`,
      [scoreObtained !== undefined ? scoreObtained : null, resultStatus, examinerNotes || null, req.params.id]
    );

    res.json({ success: true, message: 'Test score and result updated.' });
  } catch (error) {
    console.error('updateTestResult error:', error);
    res.status(500).json({ success: false, message: 'Server error updating test result.' });
  }
};
