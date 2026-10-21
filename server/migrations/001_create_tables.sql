-- Migration: 001_create_tables.sql
-- Driving School Management System Database Schema (TiDB / MySQL Compatible)
-- COCSIT Capstone Project - 9 Core Master Tables

-- 1. UserMaster: Authentication, Roles, Profile & LLR Records
CREATE TABLE IF NOT EXISTS UserMaster (
  UserID INT AUTO_INCREMENT PRIMARY KEY,
  FullName VARCHAR(150) NOT NULL,
  Email VARCHAR(150) NOT NULL UNIQUE,
  PasswordHash VARCHAR(255) NOT NULL,
  Role ENUM('Admin', 'Instructor', 'Student') NOT NULL DEFAULT 'Student',
  Phone VARCHAR(20),
  LLRNumber VARCHAR(50),
  Address TEXT,
  Status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_role (Role),
  INDEX idx_user_email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. VehicleMaster: Fleet Assets, Dual-Control, Fitness & Insurance (Created before Instructor for FK)
CREATE TABLE IF NOT EXISTS VehicleMaster (
  VehicleID INT AUTO_INCREMENT PRIMARY KEY,
  RegistrationNumber VARCHAR(30) NOT NULL UNIQUE,
  ModelType VARCHAR(100) NOT NULL,
  Category ENUM('Two-Wheeler', 'Four-Wheeler', 'Commercial') NOT NULL,
  Transmission ENUM('Manual', 'Automatic') NOT NULL DEFAULT 'Manual',
  HasDualControl BOOLEAN NOT NULL DEFAULT TRUE,
  FitnessExpiryDate DATE,
  InsuranceExpiryDate DATE,
  Status ENUM('Available', 'InUse', 'UnderMaintenance', 'Retired') DEFAULT 'Available',
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vehicle_category (Category),
  INDEX idx_vehicle_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. InstructorMaster: Certified Drivers, Shift Hours, Assigned Vehicle
CREATE TABLE IF NOT EXISTS InstructorMaster (
  InstructorID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT NOT NULL UNIQUE,
  LicenseNumber VARCHAR(50) NOT NULL UNIQUE,
  LicenseExpiryDate DATE,
  Specialization VARCHAR(100),
  ExperienceYears INT DEFAULT 0,
  AssignedVehicleID INT NULL,
  WorkingHoursStart TIME DEFAULT '07:00:00',
  WorkingHoursEnd TIME DEFAULT '19:00:00',
  Status ENUM('Active', 'OnLeave', 'Inactive') DEFAULT 'Active',
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (UserID) REFERENCES UserMaster(UserID) ON DELETE CASCADE,
  FOREIGN KEY (AssignedVehicleID) REFERENCES VehicleMaster(VehicleID) ON DELETE SET NULL,
  INDEX idx_instructor_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CourseMaster: Training Programs, Syllabi, Hours, Fees
CREATE TABLE IF NOT EXISTS CourseMaster (
  CourseID INT AUTO_INCREMENT PRIMARY KEY,
  CourseCode VARCHAR(30) NOT NULL UNIQUE,
  CourseName VARCHAR(150) NOT NULL,
  Category ENUM('Two-Wheeler (MCWG)', 'Four-Wheeler (LMV-Manual)', 'Four-Wheeler (LMV-Auto)', 'Commercial (HMV)') NOT NULL,
  Description TEXT,
  DurationDays INT NOT NULL DEFAULT 30,
  TheoryHours INT NOT NULL DEFAULT 10,
  PracticalHours INT NOT NULL DEFAULT 20,
  Fee DECIMAL(10, 2) NOT NULL,
  Status ENUM('Active', 'Inactive') DEFAULT 'Active',
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_course_category (Category),
  INDEX idx_course_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. SessionMaster: Daily Training Time Slots & Capacity Definitions
CREATE TABLE IF NOT EXISTS SessionMaster (
  SessionID INT AUTO_INCREMENT PRIMARY KEY,
  SessionName VARCHAR(100) NOT NULL,
  StartTime TIME NOT NULL,
  EndTime TIME NOT NULL,
  CapacityPerSlot INT NOT NULL DEFAULT 1,
  Status ENUM('Active', 'Inactive') DEFAULT 'Active',
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BookingMaster: Student Reservations, Practical Driving Sessions
CREATE TABLE IF NOT EXISTS BookingMaster (
  BookingID INT AUTO_INCREMENT PRIMARY KEY,
  StudentID INT NOT NULL,
  CourseID INT NOT NULL,
  InstructorID INT NOT NULL,
  VehicleID INT NOT NULL,
  SessionDate DATE NOT NULL,
  TimeSlot VARCHAR(50) NOT NULL,
  Status ENUM('Scheduled', 'Completed', 'Cancelled', 'Rescheduled') DEFAULT 'Scheduled',
  Notes TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (StudentID) REFERENCES UserMaster(UserID) ON DELETE CASCADE,
  FOREIGN KEY (CourseID) REFERENCES CourseMaster(CourseID) ON DELETE CASCADE,
  FOREIGN KEY (InstructorID) REFERENCES InstructorMaster(InstructorID) ON DELETE RESTRICT,
  FOREIGN KEY (VehicleID) REFERENCES VehicleMaster(VehicleID) ON DELETE RESTRICT,
  UNIQUE KEY uq_instructor_date_slot (InstructorID, SessionDate, TimeSlot),
  UNIQUE KEY uq_vehicle_date_slot (VehicleID, SessionDate, TimeSlot),
  INDEX idx_booking_student (StudentID),
  INDEX idx_booking_date (SessionDate),
  INDEX idx_booking_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. AttendanceMaster: Practical Driving Session Attendance & Lesson Log
CREATE TABLE IF NOT EXISTS AttendanceMaster (
  AttendanceID INT AUTO_INCREMENT PRIMARY KEY,
  BookingID INT NOT NULL UNIQUE,
  StudentID INT NOT NULL,
  InstructorID INT NOT NULL,
  SessionDate DATE NOT NULL,
  AttendanceStatus ENUM('Present', 'Absent', 'Late') DEFAULT 'Present',
  KilometersDriven DECIMAL(5, 2) DEFAULT 0.00,
  TopicsCovered TEXT,
  CompetencyRating INT DEFAULT 3,
  InstructorFeedback TEXT,
  LoggedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (BookingID) REFERENCES BookingMaster(BookingID) ON DELETE CASCADE,
  FOREIGN KEY (StudentID) REFERENCES UserMaster(UserID) ON DELETE CASCADE,
  FOREIGN KEY (InstructorID) REFERENCES InstructorMaster(InstructorID) ON DELETE RESTRICT,
  INDEX idx_attendance_student (StudentID),
  INDEX idx_attendance_date (SessionDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TestScheduleMaster: Mock Rules Quizzes & Official RTO Practical Tests
CREATE TABLE IF NOT EXISTS TestScheduleMaster (
  TestID INT AUTO_INCREMENT PRIMARY KEY,
  StudentID INT NOT NULL,
  CourseID INT NOT NULL,
  TestType ENUM('Theory_Mock_Quiz', 'Practical_Internal_Mock', 'Official_RTO_Test') NOT NULL,
  TestDate DATE NOT NULL,
  TestTime TIME,
  ScoreObtained DECIMAL(5, 2) NULL,
  TotalScore DECIMAL(5, 2) DEFAULT 100.00,
  ResultStatus ENUM('Scheduled', 'Passed', 'Failed', 'Absent', 'Pending') DEFAULT 'Scheduled',
  ExaminerOrInstructorNotes TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (StudentID) REFERENCES UserMaster(UserID) ON DELETE CASCADE,
  FOREIGN KEY (CourseID) REFERENCES CourseMaster(CourseID) ON DELETE CASCADE,
  INDEX idx_test_student (StudentID),
  INDEX idx_test_date (TestDate),
  INDEX idx_test_status (ResultStatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. PaymentMaster: Course Invoices, Simulated Transactions & PDF Receipts
CREATE TABLE IF NOT EXISTS PaymentMaster (
  PaymentID INT AUTO_INCREMENT PRIMARY KEY,
  StudentID INT NOT NULL,
  CourseID INT NOT NULL,
  InvoiceNumber VARCHAR(50) NOT NULL UNIQUE,
  TotalAmount DECIMAL(10, 2) NOT NULL,
  AmountPaid DECIMAL(10, 2) NOT NULL,
  BalanceAmount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  PaymentMethod ENUM('Cash', 'UPI_Simulated', 'DebitCard_Simulated', 'NetBanking_Simulated') DEFAULT 'UPI_Simulated',
  TransactionReference VARCHAR(100) NOT NULL UNIQUE,
  PaymentStatus ENUM('Completed', 'Partial', 'Pending', 'Failed') DEFAULT 'Completed',
  PaymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ReceiptUrl VARCHAR(255) NULL,
  FOREIGN KEY (StudentID) REFERENCES UserMaster(UserID) ON DELETE CASCADE,
  FOREIGN KEY (CourseID) REFERENCES CourseMaster(CourseID) ON DELETE CASCADE,
  INDEX idx_payment_student (StudentID),
  INDEX idx_payment_status (PaymentStatus),
  INDEX idx_invoice_number (InvoiceNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
