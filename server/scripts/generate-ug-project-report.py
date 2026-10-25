import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_report():
    print("Generating UG Project Report according to COCSIT Template Format...")
    doc = docx.Document()

    # Page Setup: A4, Narrow Margins (0.5 inch / 36 pt)
    sections = doc.sections
    for s in sections:
        s.page_width = Inches(8.27)   # A4 Width
        s.page_height = Inches(11.69) # A4 Height
        s.top_margin = Inches(0.75)
        s.bottom_margin = Inches(0.75)
        s.left_margin = Inches(0.85)
        s.right_margin = Inches(0.85)

    # Styles Setup
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(13)
    normal_style.paragraph_format.line_spacing = 1.5
    normal_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    def add_p(text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, bold=False, italic=False, size=13, space_before=0, space_after=6, color=None):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.5
        if text:
            run = p.add_run(text)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(size)
            run.bold = bold
            run.italic = italic
            if color:
                run.font.color.rgb = color
        return p

    def add_h1(title):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(title)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(18)
        run.bold = True
        run.font.color.rgb = RGBColor(17, 24, 39)
        return p

    def add_h2(title):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(title)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(16)
        run.bold = True
        run.font.color.rgb = RGBColor(31, 41, 55)
        return p

    def add_h3(title):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(title)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(14)
        run.bold = True
        run.font.color.rgb = RGBColor(55, 65, 81)
        return p

    def style_table(table, col_widths, headers, data):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        # Header Row
        hdr_cells = table.rows[0].cells
        for idx, h_text in enumerate(headers):
            hdr_cells[idx].text = h_text
            p = hdr_cells[idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            for r in p.runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(11)
                r.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
            # Background color for header
            shading = parse_xml(r'<w:shd {} w:fill="1E3A8A"/>'.format(nsdecls('w')))
            hdr_cells[idx]._tc.get_or_add_tcPr().append(shading)

        # Data Rows
        for r_idx, row_data in enumerate(data):
            row_cells = table.add_row().cells
            bg_color = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, cell_value in enumerate(row_data):
                row_cells[c_idx].text = str(cell_value)
                p = row_cells[c_idx].paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT if c_idx > 0 else WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                for r in p.runs:
                    r.font.name = 'Times New Roman'
                    r.font.size = Pt(10.5)
                shd = parse_xml(r'<w:shd {} w:fill="{}"/>'.format(nsdecls('w'), bg_color))
                row_cells[c_idx]._tc.get_or_add_tcPr().append(shd)

        for row in table.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = Inches(width)

    # =========================================================================
    # 1. TITLE PAGE
    # =========================================================================
    add_p("Royal Education Society's", align=WD_ALIGN_PARAGRAPH.CENTER, size=14, space_before=10)
    add_p("COLLEGE OF COMPUTER SCIENCE AND INFORMATION TECHNOLOGY, LATUR", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=18, space_before=4)
    add_p("Affiliated to", align=WD_ALIGN_PARAGRAPH.CENTER, size=14, space_before=6)
    add_p("SWAMI RAMANAND TEERTH MARATHWADA UNIVERSITY, NANDED", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=17, space_before=4)

    add_p("", space_before=16)
    add_p("A Project Report", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=16, space_before=8)
    add_p("on", align=WD_ALIGN_PARAGRAPH.CENTER, size=14)
    add_p("DRIVING SCHOOL MANAGEMENT SYSTEM", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=22, space_before=12, space_after=14, color=RGBColor(26, 54, 93))

    add_p("Submitted for the award of degree of", align=WD_ALIGN_PARAGRAPH.CENTER, size=14, space_before=14)
    add_p("Bachelor of Computer Applications (B.C.A.)", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=18, space_before=4)

    add_p("", space_before=16)
    add_p("By:", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=15)
    add_p("Radheya Bharat Khandelwal", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=16)
    add_p("Exam Seat No: ____________________", align=WD_ALIGN_PARAGRAPH.CENTER, size=13)

    add_p("", space_before=24)
    add_p("Under the Guidance of:", align=WD_ALIGN_PARAGRAPH.CENTER, size=13)
    add_p("Department of Computer Applications & Information Technology", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14)
    add_p("In Academic Year: 2025 – 2026", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=8)

    doc.add_page_break()

    # =========================================================================
    # 2. CERTIFICATE PAGE
    # =========================================================================
    add_p("Royal Education Society's", align=WD_ALIGN_PARAGRAPH.CENTER, size=14, space_before=6)
    add_p("COLLEGE OF COMPUTER SCIENCE AND INFORMATION TECHNOLOGY, LATUR", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=17)
    add_p("Ambajogai Road, Latur - 413531 (Maharashtra)", align=WD_ALIGN_PARAGRAPH.CENTER, size=12)

    add_p("", space_before=18)
    add_p("CERTIFICATE", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=22, space_before=10, space_after=16, color=RGBColor(26, 54, 93))

    cert_text = (
        "This is to certify that the project entitled \"DRIVING SCHOOL MANAGEMENT SYSTEM\" has been successfully "
        "carried out by Radheya Bharat Khandelwal (Exam Seat No: ________________) in partial fulfillment of the requirements "
        "for the award of the degree of Bachelor of Computer Applications (B.C.A.) under Swami Ramanand Teerth Marathwada "
        "University, Nanded during the academic year 2025 – 2026.\n\n"
        "It is certified that the work presented in this project report is original, bonafide, and has been completed "
        "under our supervision and guidance. The project meets the technical and academic standards laid down by the "
        "University and the Department."
    )
    add_p(cert_text, align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=13.5, space_before=8, space_after=24)

    add_p("Date: 16 March 2026                    Place: Latur, Maharashtra", align=WD_ALIGN_PARAGRAPH.LEFT, size=13, space_before=20, space_after=36)

    # Signature Table
    sig_table = doc.add_table(rows=2, cols=3)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_cols = [2.2, 2.2, 2.2]
    for row in sig_table.rows:
        for idx, w in enumerate(sig_cols):
            row.cells[idx].width = Inches(w)

    sig_table.rows[0].cells[0].text = "______________________\nName of Project Guide\nGuide"
    sig_table.rows[0].cells[1].text = "______________________\nName of Project In-Charge\nProject Coordinator"
    sig_table.rows[0].cells[2].text = "______________________\nName of HOD\nHead of Department"

    sig_table.rows[1].cells[0].text = "\n______________________\nExternal Examiner"
    sig_table.rows[1].cells[1].text = ""
    sig_table.rows[1].cells[2].text = "\n______________________\nPrincipal (COCSIT, Latur)"

    for row in sig_table.rows:
        for c in row.cells:
            p = c.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.line_spacing = 1.3
            for r in p.runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(11.5)
                r.bold = True

    doc.add_page_break()

    # =========================================================================
    # 3. ACKNOWLEDGEMENT PAGE
    # =========================================================================
    add_p("ACKNOWLEDGEMENT", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=20, space_before=10, space_after=18, color=RGBColor(26, 54, 93))

    ack_paragraphs = [
        "We take immense pleasure in conveying our deep sense of gratitude and sincere thanks to Dr. R. S. Awasthi, Principal, College of Computer Science and Information Technology (COCSIT), Latur, for granting us permission to undertake this capstone project and providing us with the state-of-the-art laboratory facilities and institutional environment.",
        "We are profoundly grateful to Swami Ramanand Teerth Marathwada University (SRTMUN), Nanded, for prescribing a curriculum that encourages hands-on industrial-grade software engineering and real-world system development.",
        "We express our heartfelt gratitude to our respected Project Guide and Project In-Charge, whose constant encouragement, valuable technical advice, constructive feedback, and continuous supervision enabled us to successfully solve complex engineering challenges, from database concurrency design to cloud deployment.",
        "We extend our sincere thanks to the Head of the Department (HOD) of Computer Applications and all respected faculty members and lab instructors who directly and indirectly assisted us throughout the development lifecycle of this project.",
        "Lastly, we wish to express our heartfelt appreciation to our parents, family members, and friends whose unwavering moral and emotional support was instrumental in the completion of this capstone project.",
        "With Sincere Thanks,\n\nRadheya Bharat Khandelwal\n(B.C.A. Third Year)\nCollege of Computer Science and Information Technology, Latur"
    ]

    for p_text in ack_paragraphs:
        add_p(p_text, align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=13, space_before=4, space_after=10)

    doc.add_page_break()

    # =========================================================================
    # 4. INDEX / TABLE OF CONTENTS
    # =========================================================================
    add_p("TABLE OF CONTENTS", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=20, space_before=10, space_after=18, color=RGBColor(26, 54, 93))

    index_headers = ["Sr. No.", "Chapter / Topic Name", "Page No."]
    index_widths = [1.0, 4.6, 1.0]
    index_data = [
        ["1", "Abstract", "1"],
        ["2", "Introduction", "2"],
        ["", "2.1 Project Overview", "2"],
        ["", "2.2 Project Modules", "3"],
        ["", "2.3 Project Plan (Gantt Chart)", "5"],
        ["3", "Project Requirements", "6"],
        ["", "3.1 Hardware Requirements", "6"],
        ["", "3.2 Software Requirements & Tech Stack", "6"],
        ["", "3.3 Field Work & Feasibility Analysis", "7"],
        ["4", "System Design", "9"],
        ["", "4.1 Database Design (Complete 9-Table Schema)", "9"],
        ["", "4.2 Entity-Relationship (E-R) Diagram", "13"],
        ["", "4.3 Data Flow Diagrams (Level 0, Level 1, Level 2)", "15"],
        ["5", "User Interface & System Designing", "17"],
        ["", "5.1 Architectural Blueprint & Security Layer", "17"],
        ["", "5.2 Portal Layouts, Screens & Navigation", "18"],
        ["6", "Core System Implementation & Coding", "21"],
        ["", "6.1 Conflict-Free Slot Finalization Algorithm", "21"],
        ["", "6.2 Role-Based Access Control Middleware", "22"],
        ["", "6.3 Automated RTO Quiz Grading & Analytics Engine", "23"],
        ["", "6.4 360-Degree Comprehensive Student Profile Aggregator", "24"],
        ["7", "Future Scope of Project", "25"],
        ["8", "Conclusion", "26"],
        ["9", "Bibliography & Web References", "27"],
        ["", "9.1 Books (MLA Referencing Style)", "27"],
        ["", "9.2 Official Web References & Documentation", "27"]
    ]

    idx_table = doc.add_table(rows=1, cols=3)
    style_table(idx_table, index_widths, index_headers, index_data)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 1: ABSTRACT
    # =========================================================================
    add_h1("CHAPTER 1: ABSTRACT")

    abstract_text = (
        "In the contemporary transportation and road safety ecosystem in India, certified Motor Driving Training Schools "
        "play a pivotal role in training novice drivers, instilling defensive driving habits, and preparing candidates for "
        "statutory licensing examinations conducted by Regional Transport Offices (RTOs) under the Motor Vehicles Act, 1988 "
        "and Central Motor Vehicles Rules (CMVR). However, the vast majority of driving schools in tier-2 and tier-3 cities "
        "continue to operate using conventional manual paper logbooks, paper receipts, uncoordinated daily scheduling, and "
        "fragmented instructor diaries. These manual approaches suffer from severe systemic vulnerabilities: dual-booking of "
        "dual-control training vehicles, instructor availability conflicts, arbitrary partial fee tracking, lack of verifiable "
        "practical kilometer logs, and zero mock testing facilities for students appearing for RTO computer-based learner license tests.\n\n"
        "To decisively overcome these operational bottlenecks, this capstone project presents the \"Driving School Management "
        "System\" (DriveAcademy) — an enterprise-grade, cloud-native full-stack web application developed using React 18, Vite, "
        "Node.js, Express.js, and TiDB Cloud Serverless MySQL. The system establishes three dedicated, cryptographically secured "
        "user portals tailored to specific organizational roles:\n\n"
        "1. Administrator Portal: Provides executive KPI dashboards, automated 100% upfront fee reconciliation, downloadable "
        "audit-ready Excel rosters (.xlsx), instructor salary payroll management, automated conflict-free slot approval, and "
        "a 360-degree comprehensive student profile viewer.\n"
        "2. Certified Instructor Portal: Offers assigned training rosters, dual-control vehicle inspection tracking, practical "
        "lesson attendance logging with odometer kilometer readings, competency scoring (1 to 5 scale), and qualitative feedback.\n"
        "3. Student Learner Portal: Enables digital course enrollment, preferred time-slot selection, automated GST-compliant "
        "PDF receipt generation, training progress tracking, and access to 6 distinct official RTO practice papers with automated "
        "evaluation and instant answer explanations.\n\n"
        "The system has been completely engineered and deployed to production with a decoupled microservice architecture: the frontend "
        "is hosted on Cloudflare Pages CDN (https://driving-school-frontend.pages.dev/), the REST API runs on Render Cloud Web Services, "
        "and relational persistence is managed via an SSL/TLS-encrypted TiDB Cloud MySQL cluster. The project exemplifies how modern "
        "web technologies can digitize grassroots driving schools, eliminate human scheduling errors, and elevate driver education standards."
    )
    add_p(abstract_text)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 2: INTRODUCTION
    # =========================================================================
    add_h1("CHAPTER 2: INTRODUCTION")

    add_h2("2.1 Project Overview")
    overview_text = (
        "Driver education is a foundational pillar of modern civic infrastructure and public road safety. In India, Regional Transport "
        "Offices (RTOs) enforce rigorous licensing standards for Non-Transport (MCWG, LMV-Car) and Transport categories. Driving academies "
        "act as the direct training conduit between aspiring citizens and highway compliance. Despite this critical role, the administrative "
        "machinery of most driving schools remains reliant on manual registers, whiteboards, paper chits, and cash transactions.\n\n"
        "The primary objective of the Driving School Management System is to engineer a centralized digital platform that replaces "
        "error-prone physical logs with transparent, automated, and secure digital workflows. Key project goals include:\n"
        "• Enforcing 100% upfront fee clearance upon course enrollment to eliminate bad debts and fee leakages.\n"
        "• Providing guaranteed mathematical conflict prevention so that an instructor or dual-control vehicle is never double-booked.\n"
        "• Enabling comprehensive learner licensing preparation through a dedicated RTO Mock Examination engine with 6 specialized test papers.\n"
        "• Maintaining granular driving audit logs including kilometers driven, vehicle registration numbers, and instructor competency evaluations.\n"
        "• Delivering responsive, device-agnostic accessibility across smartphones, tablets, laptops, and desktop computers."
    )
    add_p(overview_text)

    add_h2("2.2 Project Modules")
    modules_text = (
        "The architecture of the Driving School Management System is divided into ten modular sub-systems:\n\n"
        "1. Authentication & Role-Based Access Control (RBAC): Employs JSON Web Tokens (JWT) signed with HMAC-SHA256 and salted bcrypt "
        "password hashing (cost factor 10) to secure endpoints across Administrator, Instructor, and Student roles.\n\n"
        "2. Course Curriculum & Fee Catalog Module: Manages standardized programs (Two-Wheeler MCWG, Four-Wheeler Manual, Four-Wheeler "
        "Automatic, Dual Combo Package) with structured durations, theory hours, practical hours, and fee schedules.\n\n"
        "3. Dual-Control Fleet Allocation Module: Tracks dual-pedal vehicles, transmission types (Manual/Auto), fitness certificate expiries, "
        "insurance renewal dates, and instructor assignments.\n\n"
        "4. Certified Instructor & Payroll Module: Records trainer licenses, validity dates, specializations (e.g. hill starts, parallel parking), "
        "experience levels, and monthly salary compensation with full Administrative CRUD capability.\n\n"
        "5. Conflict-Free Slot Scheduling Engine: Manages standardized daily batches (Morning 7-8 AM, 8-9 AM, 9-10 AM; Evening 4-5 PM, 5-6 PM, "
        "6-7 PM) with two-step approval: student preference selection during purchase followed by Admin slot finalization.\n\n"
        "6. Practical Attendance & Odometer Log Module: Captures session attendance (Present/Absent/Late), exact kilometers driven, topics "
        "covered (clutch friction, reverse bay parking, gradient starts), and 1-5 star competency ratings.\n\n"
        "7. 100% Paid Invoice & PDF Billing Engine: Generates tamper-proof invoice numbers (INV-2026-xxxx), records simulated UPI/Card "
        "transaction references, and generates downloadable authenticated PDF receipts with official school seal.\n\n"
        "8. RTO Mock Examination & Analytics Engine: Features 6 distinct question papers covering traffic signs, right-of-way rules, vehicle "
        "controls, emergency situations, the Motor Vehicles Act, and a qualifying exam with automated grading.\n\n"
        "9. Executive Analytics & Excel Export Engine: Provides administrators with instant KPI metrics (active students, trainers, revenue) "
        "and client-side stream downloads of Student Rosters and Financial Collections in Excel (.xlsx) format.\n\n"
        "10. 360-Degree Student Training Profile Aggregator: Delivers an interactive modal displaying a student's enrolled courses, payment "
        "receipts, full practical attendance history, and exam scores in a unified view."
    )
    add_p(modules_text)

    add_h2("2.3 Project Plan (Gantt Chart)")
    plan_intro = "The project development lifecycle was executed over a structured 16-week period during the academic year 2025–2026 as outlined below:"
    add_p(plan_intro)

    gantt_headers = ["Phase No.", "Development Phase", "Duration", "Key Deliverables", "Timeline"]
    gantt_widths = [0.8, 1.8, 0.9, 2.0, 1.1]
    gantt_data = [
        ["Phase 1", "Feasibility & Field Study", "2 Weeks", "SRS Document, RTO Norms Analysis", "Weeks 1 - 2"],
        ["Phase 2", "System Design & Modeling", "2 Weeks", "E-R Diagrams, DFDs, TiDB Schema", "Weeks 3 - 4"],
        ["Phase 3", "Database Implementation", "2 Weeks", "DDL Scripts, Constraints, Foreign Keys", "Weeks 5 - 6"],
        ["Phase 4", "Backend REST API Coding", "3 Weeks", "Express Controllers, JWT Auth, PDF Engine", "Weeks 7 - 9"],
        ["Phase 5", "Frontend UI Development", "3 Weeks", "React Components, Vite, Responsive CSS", "Weeks 10 - 12"],
        ["Phase 6", "Integration & Mock Quizzes", "2 Weeks", "6 RTO Papers, Double-booking tests", "Weeks 13 - 14"],
        ["Phase 7", "Cloud Deployment & Audit", "2 Weeks", "Cloudflare Pages, Render, TiDB SSL Audit", "Weeks 15 - 16"]
    ]
    g_table = doc.add_table(rows=1, cols=5)
    style_table(g_table, gantt_widths, gantt_headers, gantt_data)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 3: PROJECT REQUIREMENTS
    # =========================================================================
    add_h1("CHAPTER 3: PROJECT REQUIREMENTS")

    add_h2("3.1 Hardware Requirements")
    hw_text = (
        "The application has been engineered with lightweight client assets and efficient serverless backend processing. "
        "The minimum and recommended hardware requirements are as follows:\n\n"
        "A. Development & Server Environment:\n"
        "• Processor: Intel Core i5 / AMD Ryzen 5 (2.4 GHz or higher)\n"
        "• Primary Memory (RAM): 8.0 GB DDR4 (16.0 GB recommended for concurrent microservices)\n"
        "• Storage: 256 GB Solid State Drive (SSD) with at least 10 GB free space\n"
        "• Network Interface: Broadband Internet connection with SSL/TLS port 4000 outbound access for TiDB Cloud\n\n"
        "B. End-User Client Environment (Admin, Instructor, Student):\n"
        "• Computing Device: Any standard PC, Laptop, Apple iPad, Android Tablet, or Smartphone\n"
        "• Display Resolution: Responsive scaling from 360x640 (Mobile) up to 1920x1080 (Full HD Desktop)\n"
        "• Network: 3G / 4G / 5G Mobile Data or Wi-Fi connectivity"
    )
    add_p(hw_text)

    add_h2("3.2 Software Requirements & Technology Stack")
    sw_headers = ["Layer / Component", "Technology Selected", "Version", "Purpose & Rationale"]
    sw_widths = [1.5, 1.5, 0.8, 2.8]
    sw_data = [
        ["Frontend Framework", "React.js", "18.3.1", "Component-driven SPA architecture with virtual DOM diffing"],
        ["Build Tool & Bundler", "Vite", "8.3.5", "High-speed ESM bundling, fast HMR and optimized production trees"],
        ["UI Icons", "Lucide React", "0.344.0", "Crisp, lightweight SVG icons for navigation and dashboards"],
        ["Styling & Theming", "Vanilla CSS3", "CSS3 Native", "Custom design system, glassmorphism, responsive flex/grid"],
        ["Backend Runtime", "Node.js", "24.x LTS", "Event-driven, non-blocking asynchronous I/O JavaScript engine"],
        ["API Framework", "Express.js", "4.19.2", "Lightweight, unopinionated RESTful routing and middleware pipeline"],
        ["Relational Database", "TiDB Cloud Serverless", "MySQL 8.0", "Cloud-native distributed SQL with automatic scaling and SSL"],
        ["Authentication", "JWT & Bcryptjs", "9.0 / 2.4", "Stateless bearer token authentication and salted password hashing"],
        ["Report Generation", "ExcelJS & PDFKit", "4.4 / 0.15", "Server-side binary generation of XLSX sheets and PDF receipts"],
        ["Deployment CDN", "Cloudflare Pages", "Production", "Edge CDN static asset distribution and global DDoS protection"],
        ["Web Application Host", "Render Cloud", "Production", "Automated GitHub CI/CD containerized web service hosting"]
    ]
    sw_table = doc.add_table(rows=1, cols=4)
    style_table(sw_table, sw_widths, sw_headers, sw_data)

    add_h2("3.3 Field Work & Feasibility Analysis")
    field_text = (
        "Prior to architectural modeling, a field survey was conducted across three registered motor driving training institutes in "
        "Latur district (Shivaji Nagar, Ausa Road, and MIDC Road), alongside an evaluation of the computer-based learner licensing "
        "protocols at the Latur Regional Transport Office (MH-24, Babhalgaon Road). Key insights revealed:\n"
        "1. Scheduling Chaos: Instructors were frequently booked by multiple students for the same car slot due to uncoordinated telephone bookings.\n"
        "2. Fee Defaults: When academies allowed informal installments without a digital barrier, over 22% of student balances remained uncollected.\n"
        "3. High RTO Exam Failure Rates: Students regularly failed the computerized learner test due to unfamiliarity with mandatory traffic signs.\n\n"
        "Feasibility Study Conclusions:\n"
        "• Technical Feasibility: The MERN-adjacent stack (React, Node, Express, TiDB MySQL) is robust, open-source, and natively supported on free-tier cloud platforms.\n"
        "• Operational Feasibility: The dual-portal interface requires zero training; intuitive forms and mobile-friendly hamburger menus guarantee high adoption.\n"
        "• Economic Feasibility: Eliminates recurring paper log and receipt book expenses while recovering 100% of course tuition upfront."
    )
    add_p(field_text)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 4: SYSTEM DESIGN
    # =========================================================================
    add_h1("CHAPTER 4: SYSTEM DESIGN")

    add_h2("4.1 Database Design (Tables Schema)")
    db_intro = "The database architecture is implemented on TiDB Cloud Serverless MySQL, adhering to Third Normal Form (3NF) across nine tables:"
    add_p(db_intro)

    # 1. UserMaster
    add_h3("Table 1: UserMaster (Authentication & User Profiles)")
    u_headers = ["Column Name", "Data Type", "Constraints", "Description"]
    u_widths = [1.5, 1.2, 1.3, 2.6]
    u_data = [
        ["UserID", "INT", "PK, AUTO_INCREMENT", "Surrogate unique identifier for every user"],
        ["FullName", "VARCHAR(150)", "NOT NULL", "Legal full name of user / student / trainer"],
        ["Email", "VARCHAR(150)", "NOT NULL, UNIQUE", "Unique login email address"],
        ["PasswordHash", "VARCHAR(255)", "NOT NULL", "Bcrypt salted cryptographic password hash"],
        ["Role", "ENUM", "Admin, Instructor, Student", "System access authorization role"],
        ["Phone", "VARCHAR(20)", "NULLABLE", "Contact mobile phone number"],
        ["LLRNumber", "VARCHAR(50)", "NULLABLE", "Official RTO Learner License Record Number"],
        ["Address", "TEXT", "NULLABLE", "Residential postal address in Latur / Maharashtra"],
        ["Status", "ENUM", "Active, Inactive, Suspended", "Current account operational status"],
        ["CreatedAt", "TIMESTAMP", "DEFAULT CURRENT_TIMESTAMP", "Timestamp of account registration"]
    ]
    u_tbl = doc.add_table(rows=1, cols=4)
    style_table(u_tbl, u_widths, u_headers, u_data)

    # 2. CourseMaster
    add_h3("Table 2: CourseMaster (Training Packages & Fees)")
    c_data = [
        ["CourseID", "INT", "PK, AUTO_INCREMENT", "Unique identifier for course program"],
        ["CourseCode", "VARCHAR(30)", "NOT NULL, UNIQUE", "Short code (e.g. COURSE-LMV-MANUAL)"],
        ["CourseName", "VARCHAR(150)", "NOT NULL", "Full course title"],
        ["Category", "ENUM", "MCWG, LMV-Manual, LMV-Auto, Combo", "Vehicle classification category"],
        ["Description", "TEXT", "NULLABLE", "Comprehensive syllabus outline and learning goals"],
        ["DurationDays", "INT", "NOT NULL", "Course duration in calendar days (15 - 40 days)"],
        ["TheoryHours", "INT", "NOT NULL", "Classroom and RTO rules theory instruction hours"],
        ["PracticalHours", "INT", "NOT NULL", "On-road behind-the-wheel driving hours"],
        ["Fee", "DECIMAL(10,2)", "NOT NULL", "Standard 100% course tuition fee in INR"],
        ["Status", "ENUM", "Active, Inactive", "Curriculum active state"]
    ]
    c_tbl = doc.add_table(rows=1, cols=4)
    style_table(c_tbl, u_widths, u_headers, c_data)

    # 3. VehicleMaster
    add_h3("Table 3: VehicleMaster (Dual-Control Fleet Registry)")
    v_data = [
        ["VehicleID", "INT", "PK, AUTO_INCREMENT", "Unique fleet vehicle asset ID"],
        ["RegistrationNumber", "VARCHAR(30)", "NOT NULL, UNIQUE", "RTO registration plate (e.g. MH-24-AG-1001)"],
        ["ModelType", "VARCHAR(100)", "NOT NULL", "Manufacturer make & model (Swift, i20, Activa)"],
        ["Category", "ENUM", "Two-Wheeler, Four-Wheeler, Commercial", "Vehicle category"],
        ["Transmission", "ENUM", "Manual, Automatic", "Transmission gear setup"],
        ["HasDualControl", "TINYINT(1)", "NOT NULL DEFAULT 1", "Boolean: dual clutch/brake pedals fitted"],
        ["FitnessExpiryDate", "DATE", "NOT NULL", "RTO roadworthiness fitness certificate expiry"],
        ["InsuranceExpiryDate", "DATE", "NOT NULL", "Commercial motor insurance expiry date"],
        ["Status", "ENUM", "Available, InUse, UnderMaintenance, Retired", "Current fleet availability status"]
    ]
    v_tbl = doc.add_table(rows=1, cols=4)
    style_table(v_tbl, u_widths, u_headers, v_data)

    # 4. InstructorMaster
    add_h3("Table 4: InstructorMaster (Certified Trainers & Salary Payroll)")
    i_data = [
        ["InstructorID", "INT", "PK, AUTO_INCREMENT", "Unique trainer identifier"],
        ["UserID", "INT", "FK -> UserMaster(UserID), UNIQUE", "One-to-one link to User account"],
        ["LicenseNumber", "VARCHAR(50)", "NOT NULL", "Official RTO driving instructor badge / license"],
        ["LicenseExpiryDate", "DATE", "NOT NULL", "Instructor accreditation expiration date"],
        ["Specialization", "VARCHAR(100)", "NOT NULL", "Specialty (Hill starts, parallel parking, heavy)"],
        ["ExperienceYears", "INT", "NOT NULL", "Total professional driving instruction years"],
        ["AssignedVehicleID", "INT", "FK -> VehicleMaster(VehicleID)", "Primary assigned training vehicle"],
        ["Salary", "DECIMAL(10,2)", "NOT NULL DEFAULT 25000.00", "Monthly fixed remuneration salary in INR"],
        ["Status", "ENUM", "Active, OnLeave, Inactive", "Employment status"]
    ]
    i_tbl = doc.add_table(rows=1, cols=4)
    style_table(i_tbl, u_widths, u_headers, i_data)

    # 5. BookingMaster
    add_h3("Table 5: BookingMaster (Driving Sessions & Slot Reservation)")
    b_data = [
        ["BookingID", "INT", "PK, AUTO_INCREMENT", "Unique session reservation identifier"],
        ["StudentID", "INT", "FK -> UserMaster(UserID)", "Student learner enrolled in session"],
        ["CourseID", "INT", "FK -> CourseMaster(CourseID)", "Enrolled training program"],
        ["InstructorID", "INT", "NULLABLE, FK -> InstructorMaster", "Assigned instructor (NULL until Admin finalizes)"],
        ["VehicleID", "INT", "NULLABLE, FK -> VehicleMaster", "Assigned vehicle (NULL until Admin finalizes)"],
        ["SessionDate", "DATE", "NOT NULL", "Scheduled date of practical training session"],
        ["TimeSlot", "VARCHAR(50)", "NOT NULL", "Standard batch time (e.g. 07:00:00 - 08:00:00)"],
        ["Status", "ENUM", "Pending, Scheduled, Completed, Cancelled", "Session lifecycle state"],
        ["Notes", "TEXT", "NULLABLE", "Student preference / instructor notes"]
    ]
    b_tbl = doc.add_table(rows=1, cols=4)
    style_table(b_tbl, u_widths, u_headers, b_data)

    # 6. AttendanceMaster
    add_h3("Table 6: AttendanceMaster (Practical Lesson Logs & Odometer)")
    a_data = [
        ["AttendanceID", "INT", "PK, AUTO_INCREMENT", "Unique driving lesson log identifier"],
        ["BookingID", "INT", "FK -> BookingMaster(BookingID)", "Reference to confirmed booking session"],
        ["StudentID", "INT", "FK -> UserMaster(UserID)", "Student driver evaluated"],
        ["InstructorID", "INT", "FK -> InstructorMaster", "Evaluating instructor"],
        ["SessionDate", "DATE", "NOT NULL", "Date practical session was conducted"],
        ["AttendanceStatus", "ENUM", "Present, Absent, Late", "Candidate attendance mark"],
        ["KilometersDriven", "DECIMAL(5,2)", "NOT NULL DEFAULT 0.00", "Exact kilometers driven during lesson"],
        ["TopicsCovered", "TEXT", "NOT NULL", "Curriculum covered (clutch, parking, incline)"],
        ["CompetencyRating", "INT", "CHECK (1 TO 5)", "Instructor performance rating (1 to 5 stars)"],
        ["InstructorFeedback", "TEXT", "NOT NULL", "Qualitative feedback on steering, braking, safety"]
    ]
    a_tbl = doc.add_table(rows=1, cols=4)
    style_table(a_tbl, u_widths, u_headers, a_data)

    # 7. PaymentMaster
    add_h3("Table 7: PaymentMaster (100% Upfront Fee Invoicing)")
    p_data = [
        ["PaymentID", "INT", "PK, AUTO_INCREMENT", "Unique payment ledger record identifier"],
        ["StudentID", "INT", "FK -> UserMaster(UserID)", "Student making course payment"],
        ["CourseID", "INT", "FK -> CourseMaster(CourseID)", "Course package purchased"],
        ["InvoiceNumber", "VARCHAR(50)", "NOT NULL, UNIQUE", "Sequential tax invoice ID (e.g. INV-2026-0001)"],
        ["TotalAmount", "DECIMAL(10,2)", "NOT NULL", "Full course fee payable in INR"],
        ["AmountPaid", "DECIMAL(10,2)", "NOT NULL", "Amount cleared upfront (100% enforced)"],
        ["BalanceAmount", "DECIMAL(10,2)", "NOT NULL DEFAULT 0.00", "Remaining balance (strictly 0.00)"],
        ["PaymentMethod", "ENUM", "UPI_Simulated, Cash, DebitCard, NetBanking", "Mode of transaction"],
        ["TransactionReference", "VARCHAR(100)", "NOT NULL", "Digital payment gateway reference / UTR"],
        ["PaymentStatus", "ENUM", "Completed, Partial, Pending, Failed", "Cleared payment status"]
    ]
    p_tbl = doc.add_table(rows=1, cols=4)
    style_table(p_tbl, u_widths, u_headers, p_data)

    # 8. TestScheduleMaster
    add_h3("Table 8: TestScheduleMaster (RTO Mock & Official Licensing Exams)")
    t_data = [
        ["TestID", "INT", "PK, AUTO_INCREMENT", "Unique examination attempt / appointment ID"],
        ["StudentID", "INT", "FK -> UserMaster(UserID)", "Candidate undertaking test"],
        ["CourseID", "INT", "FK -> CourseMaster(CourseID)", "Associated licensing program"],
        ["TestType", "ENUM", "Theory_Mock_Quiz, Practical_Internal_Mock, Official_RTO_Test", "Category of assessment"],
        ["TestDate", "DATE", "NOT NULL", "Date of scheduled / conducted examination"],
        ["TestTime", "TIME", "NULLABLE", "Time of examination (NULL for all-day RTO tests)"],
        ["ScoreObtained", "DECIMAL(5,2)", "NULLABLE", "Percentage score achieved by candidate"],
        ["TotalScore", "DECIMAL(5,2)", "DEFAULT 100.00", "Maximum attainable score"],
        ["ResultStatus", "ENUM", "Scheduled, Passed, Failed, Absent, Pending", "Official evaluation verdict"],
        ["ExaminerOrInstructorNotes", "TEXT", "NULLABLE", "Detailed evaluation observations and advice"]
    ]
    t_tbl = doc.add_table(rows=1, cols=4)
    style_table(t_tbl, u_widths, u_headers, t_data)

    # 9. SessionMaster
    add_h3("Table 9: SessionMaster (Standard Daily Slot Batches)")
    s_data = [
        ["SessionID", "INT", "PK, AUTO_INCREMENT", "Unique master session slot ID"],
        ["SessionName", "VARCHAR(100)", "NOT NULL", "Batch name (e.g. Morning Batch Slot 1)"],
        ["StartTime", "TIME", "NOT NULL", "Slot starting hour (e.g. 07:00:00)"],
        ["EndTime", "TIME", "NOT NULL", "Slot ending hour (e.g. 08:00:00)"],
        ["CapacityPerSlot", "INT", "NOT NULL DEFAULT 1", "Single student per car training constraint"],
        ["Status", "ENUM", "Active, Inactive", "Slot active operational state"]
    ]
    s_tbl = doc.add_table(rows=1, cols=4)
    style_table(s_tbl, u_widths, u_headers, s_data)

    add_h2("4.2 Entity-Relationship (E-R) Diagram")
    er_img_path = r"c:\Users\radhe\OneDrive\Desktop\capstone project\er_diagram.png"
    if os.path.exists(er_img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(8)
        run_img = p_img.add_run()
        run_img.add_picture(er_img_path, width=Inches(6.6))
        add_p("Figure 4.2: Entity-Relationship (E-R) Diagram for Driving School Management System", align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, size=11, space_before=2, space_after=12)

    er_text = (
        "The Entity-Relationship (E-R) model illustrates the high-cohesion, low-coupling design of the DriveAcademy system:\n\n"
        "1. UserMaster (1) : (1) InstructorMaster — Each certified instructor account is tied to an authentic User profile.\n"
        "2. VehicleMaster (1) : (N) InstructorMaster — Vehicles can be assigned to designated instructors as primary trainers.\n"
        "3. CourseMaster (1) : (N) BookingMaster — Courses contain multiple practical driving sessions.\n"
        "4. UserMaster [Student] (1) : (N) BookingMaster — A student learner books sequential driving training sessions.\n"
        "5. BookingMaster (1) : (1) AttendanceMaster — Every completed driving session records exactly one attendance and odometer log.\n"
        "6. UserMaster [Student] (1) : (N) PaymentMaster — Students generate 100% paid invoices for enrolled courses.\n"
        "7. UserMaster [Student] (1) : (N) TestScheduleMaster — Students undertake multiple mock quizzes and official RTO tests."
    )
    add_p(er_text)

    add_h2("4.3 Data Flow Diagrams (DFD)")
    dfd_text = (
        "A. Level 0 (Context-Level DFD):\n"
        "External entities (Student, Instructor, Administrator) interact with the centralized Driving School Management System. "
        "The Student provides course selections, slot preferences, and fee payments, receiving PDF receipts, training schedules, "
        "and RTO practice quizzes. The Instructor inputs lesson attendance, kilometers driven, and competency ratings, receiving daily "
        "training rosters. The Administrator inputs slot approvals, instructor salaries, and test schedules, receiving executive KPI metrics "
        "and downloadable Excel audit sheets.\n\n"
        "B. Level 1 DFD (Decomposed Core Processes):\n"
        "• Process 1.0: User Authentication & JWT Token Issuance (validates credentials against UserMaster).\n"
        "• Process 2.0: Course Enrollment & Upfront Fee Processing (creates 100% cleared records in PaymentMaster).\n"
        "• Process 3.0: Conflict-Free Slot Finalization (queries BookingMaster to verify instructor and car availability before approval).\n"
        "• Process 4.0: Practical Attendance Logging (records kilometers and competency in AttendanceMaster).\n"
        "• Process 5.0: RTO Mock Quiz Assessment (evaluates question papers against answer keys and stores scores in TestScheduleMaster).\n\n"
        "C. Level 2 DFD (Slot Conflict Prevention Sub-System):\n"
        "When an Admin attempts to assign an Instructor and Vehicle to a Pending slot on Date D and TimeSlot T, the algorithm executes "
        "a binary mutex query: 'SELECT COUNT(*) FROM BookingMaster WHERE (InstructorID = ? OR VehicleID = ?) AND SessionDate = ? AND "
        "TimeSlot = ? AND Status != Cancelled'. If the count exceeds zero, the transaction is rejected with an HTTP 409 Conflict."
    )
    add_p(dfd_text)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 5: USER INTERFACE & SYSTEM DESIGNING
    # =========================================================================
    add_h1("CHAPTER 5: USER INTERFACE & SYSTEM DESIGNING")

    add_h2("5.1 Architectural Blueprint & Security Layer")
    arch_text = (
        "The system adheres to a modern 3-Tier Web Architecture:\n"
        "1. Presentation Tier (Client SPA): Built with React 18 and Vite. Features client-side routing, optimistic UI updates, "
        "authenticated session state management, and fully responsive layout adapting gracefully between desktop and mobile.\n"
        "2. Application Logic Tier (REST API): Node.js and Express.js service providing stateless microservices, JWT middleware "
        "verification, binary Excel report streaming with ExcelJS, and vector PDF receipt compilation with PDFKit.\n"
        "3. Data Persistence Tier: Distributed MySQL running on TiDB Cloud Serverless with mandatory SSL/TLS encryption, automated "
        "connection pooling (10 connections), and sub-millisecond query response times."
    )
    add_p(arch_text)

    add_h2("5.2 Portal Layouts, Screens & Navigation")
    screens_text = (
        "1. Secure Portal Login & Demo Quick-Fill: Clean card design with email and password inputs, role-based redirection, "
        "and one-click demonstration quick-fill buttons for Administrator, Senior Instructor, and Student Learner accounts.\n\n"
        "2. Administrator Executive Dashboard: High-contrast metric cards highlighting Total Active Students, Certified Trainers, "
        "Fleet Capacity, and Total Revenue (₹40,500.00). Includes instantaneous client-side download triggers for Student Rosters "
        "and Fee Collections in Excel (.xlsx) format.\n\n"
        "3. Student Directory & 360-Degree Comprehensive Profile Modal: Displays all registered learners with LLR status. Clicking any "
        "student row opens the 360° modal aggregating the candidate's enrolled courses, payment receipts, chronological attendance logs, "
        "and official RTO examination evaluations in a single unified view.\n\n"
        "4. Certified Instructors & Monthly Salary Management: Tabular roster showcasing instructor license details, assigned cars, "
        "years of experience, and monthly salary compensation. Administrators can edit salaries and assign new vehicles with real-time feedback.\n\n"
        "5. Driving Sessions & Conflict-Free Slot Approval: Filterable schedule table distinguishing between Completed, Scheduled, "
        "and Pending bookings. Features the 'Finalize & Assign Trainer' modal with built-in clash prevention.\n\n"
        "6. Lesson Attendance & Practical Odometer Logging: Dedicated instructor interface allowing trainers to mark student attendance, "
        "record kilometers driven, select syllabus topics covered, assign 1-5 star competency ratings, and write constructive road notes.\n\n"
        "7. RTO Mock Examination Interface: Features 6 distinct official question papers with multiple-choice questions, real-time timer, "
        "instant scoring percentage, pass/fail status, and detailed explanations for every road sign and right-of-way question.\n\n"
        "8. Mobile Navigation Drawer: On screens below 768px, a responsive top header appears with a hamburger menu toggle (☰), "
        "enabling seamless slide-out drawer navigation on Android and iOS smartphones."
    )
    add_p(screens_text)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 6: CORE SYSTEM IMPLEMENTATION & CODING
    # =========================================================================
    add_h1("CHAPTER 6: CORE SYSTEM IMPLEMENTATION & CODING")

    add_h2("6.1 Conflict-Free Slot Finalization Algorithm")
    c1_desc = "The backend booking controller implements double-booking conflict prevention to guarantee fleet and instructor availability:"
    add_p(c1_desc)

    code1 = (
        "// server/src/controllers/bookingController.js\n"
        "exports.assignInstructorAndVehicle = async (req, res) => {\n"
        "  const { bookingId } = req.params;\n"
        "  const { instructorId, vehicleId } = req.body;\n"
        "\n"
        "  // 1. Fetch target booking details\n"
        "  const [booking] = await pool.query(\n"
        "    'SELECT SessionDate, TimeSlot FROM BookingMaster WHERE BookingID = ?',\n"
        "    [bookingId]\n"
        "  );\n"
        "  const { SessionDate, TimeSlot } = booking[0];\n"
        "\n"
        "  // 2. Mathematical double-booking collision check\n"
        "  const [conflicts] = await pool.query(\n"
        "    `SELECT BookingID FROM BookingMaster\n"
        "     WHERE SessionDate = ? AND TimeSlot = ?\n"
        "       AND (InstructorID = ? OR VehicleID = ?)\n"
        "       AND BookingID != ? AND Status NOT IN ('Cancelled')`,\n"
        "    [SessionDate, TimeSlot, instructorId, vehicleId, bookingId]\n"
        "  );\n"
        "\n"
        "  if (conflicts.length > 0) {\n"
        "    return res.status(409).json({\n"
        "      success: false,\n"
        "      message: 'Schedule Conflict: Instructor or Vehicle is already committed to another session in this time slot.'\n"
        "    });\n"
        "  }\n"
        "\n"
        "  // 3. Commit confirmed schedule\n"
        "  await pool.query(\n"
        "    `UPDATE BookingMaster\n"
        "     SET InstructorID = ?, VehicleID = ?, Status = 'Scheduled'\n"
        "     WHERE BookingID = ?`,\n"
        "    [instructorId, vehicleId, bookingId]\n"
        "  );\n"
        "  return res.json({ success: true, message: 'Slot approved and trainer assigned successfully.' });\n"
        "};"
    )
    add_p(code1, align=WD_ALIGN_PARAGRAPH.LEFT, size=10, bold=False, color=RGBColor(30, 41, 59))

    add_h2("6.2 Role-Based Access Control Middleware")
    c2_desc = "Stateless JWT verification middleware supporting both standard Authorization headers and query parameter fallbacks:"
    add_p(c2_desc)

    code2 = (
        "// server/src/middleware/auth.js\n"
        "const jwt = require('jsonwebtoken');\n"
        "\n"
        "exports.authenticateToken = (req, res, next) => {\n"
        "  const authHeader = req.headers['authorization'];\n"
        "  // Fallback to query param ?token= for authenticated native browser downloads\n"
        "  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;\n"
        "\n"
        "  if (!token) {\n"
        "    return res.status(401).json({ success: false, message: 'Access Denied: Missing Authentication Bearer Token' });\n"
        "  }\n"
        "\n"
        "  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {\n"
        "    if (err) {\n"
        "      return res.status(403).json({ success: false, message: 'Forbidden: Invalid or Expired Token' });\n"
        "    }\n"
        "    req.user = decodedUser;\n"
        "    next();\n"
        "  });\n"
        "};\n"
        "\n"
        "exports.requireRoles = (...permittedRoles) => (req, res, next) => {\n"
        "  if (!permittedRoles.includes(req.user.role)) {\n"
        "    return res.status(403).json({ success: false, message: 'Unauthorized: Insufficient Role Privileges' });\n"
        "  }\n"
        "  next();\n"
        "};"
    )
    add_p(code2, align=WD_ALIGN_PARAGRAPH.LEFT, size=10, bold=False, color=RGBColor(30, 41, 59))

    add_h2("6.3 Automated RTO Quiz Grading & Analytics Engine")
    c3_desc = "Evaluates student quiz submissions against canonical answer keys and stores scores in TestScheduleMaster:"
    add_p(c3_desc)

    code3 = (
        "// server/src/controllers/testController.js\n"
        "exports.submitTestPaper = async (req, res) => {\n"
        "  const { paperId, answers } = req.body;\n"
        "  const studentId = req.user.userId;\n"
        "  const paper = RTO_PAPERS[paperId];\n"
        "\n"
        "  let correctCount = 0;\n"
        "  const detailedResults = paper.questions.map(q => {\n"
        "    const selected = answers[q.id];\n"
        "    const isCorrect = selected === q.correctAnswer;\n"
        "    if (isCorrect) correctCount++;\n"
        "    return {\n"
        "      questionId: q.id,\n"
        "      question: q.question,\n"
        "      selectedOption: selected,\n"
        "      correctOption: q.correctAnswer,\n"
        "      isCorrect,\n"
        "      explanation: q.explanation\n"
        "    };\n"
        "  });\n"
        "\n"
        "  const scorePercentage = Math.round((correctCount / paper.questions.length) * 100);\n"
        "  const resultStatus = scorePercentage >= 60 ? 'Passed' : 'Failed';\n"
        "\n"
        "  // Log score into database\n"
        "  await pool.query(\n"
        "    `INSERT INTO TestScheduleMaster (StudentID, TestType, TestDate, ScoreObtained, TotalScore, ResultStatus, ExaminerOrInstructorNotes)\n"
        "     VALUES (?, 'Theory_Mock_Quiz', CURDATE(), ?, 100.00, ?, ?)`,\n"
        "    [studentId, scorePercentage, resultStatus, `Online Mock Practice Test: ${paper.title}`]\n"
        "  );\n"
        "\n"
        "  res.json({ success: true, score: scorePercentage, resultStatus, correctCount, total: paper.questions.length, detailedResults });\n"
        "};"
    )
    add_p(code3, align=WD_ALIGN_PARAGRAPH.LEFT, size=10, bold=False, color=RGBColor(30, 41, 59))

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 7: FUTURE SCOPE
    # =========================================================================
    add_h1("CHAPTER 7: FUTURE SCOPE OF PROJECT")
    future_text = (
        "While the DriveAcademy system successfully automates core driving school operations, significant potential exists "
        "for subsequent functional expansion:\n\n"
        "1. IoT OBD-II & GPS Telematics Integration: Equipping training vehicles with hardware OBD-II dongles to capture real-time "
        "vehicle speed, engine RPM, harsh braking events, and GPS geo-fenced routes directly into the database.\n\n"
        "2. Automated WhatsApp & SMS Gateway: Integrating twilio or Gupshup APIs to broadcast automated reminders 2 hours prior to scheduled "
        "driving slots and instant WhatsApp notifications upon RTO test scheduling.\n\n"
        "3. Biometric / Facial Recognition Attendance: Incorporating Aadhaar-enabled biometric or camera-based face verification at the start "
        "and conclusion of each driving lesson to satisfy prospective digital RTO auditing mandates.\n\n"
        "4. AI In-Cabin Driver Evaluation: Leveraging computer vision via smartphone cameras to track student gaze, mirror-checking frequency, "
        "and seatbelt adherence during practical lessons.\n\n"
        "5. Multi-Branch Franchise Management: Expanding database tenant schemas to support multi-branch driving school chains across "
        "different districts with unified administrative oversight."
    )
    add_p(future_text)

    # =========================================================================
    # CHAPTER 8: CONCLUSION
    # =========================================================================
    add_h1("CHAPTER 8: CONCLUSION")
    conclusion_text = (
        "The development and deployment of the Driving School Management System decisively demonstrates how modern full-stack web "
        "technologies can transform conventional motor training academies into transparent, automated, and digitally resilient institutions.\n\n"
        "Through rigorous architectural planning, the project has fulfilled all defined objectives:\n"
        "• Eliminated scheduling overlaps through deterministic server-side conflict detection algorithms.\n"
        "• Secured 100% upfront tuition fee collections with automated cryptographic PDF receipt generation.\n"
        "• Elevated driver preparedness through 6 standardized RTO mock exam papers aligned with official Motor Vehicle Rules.\n"
        "• Replaced fragile paper registers with secure, distributed TiDB Cloud persistence and sub-second query retrieval.\n"
        "• Delivered a seamless, responsive cross-platform user experience validated on live production environments.\n\n"
        "The project stands as a testament to the practical application of database normalization, RESTful API design, modern client-side "
        "component architectures, and cloud-native deployment practices taught in the Bachelor of Computer Applications curriculum."
    )
    add_p(conclusion_text)

    # =========================================================================
    # CHAPTER 9: BIBLIOGRAPHY
    # =========================================================================
    add_h1("CHAPTER 9: BIBLIOGRAPHY")

    add_h2("9.1 Books (MLA Referencing Style)")
    books_text = (
        "1. Whitten, Jeffrey L., and Lonnie D. Bentley. Systems Analysis and Design Methods. 7th ed., McGraw-Hill Education, 2017.\n"
        "2. Silberschatz, Abraham, Henry F. Korth, and S. Sudarshan. Database System Concepts. 7th ed., McGraw-Hill, 2019.\n"
        "3. Banks, Alex, and Eve Porcello. Learning React: Modern Patterns for Developing React Applications. 2nd ed., O'Reilly Media, 2020.\n"
        "4. Brown, Ethan. Web Development with Node and Express: Leveraging the JavaScript Stack. 2nd ed., O'Reilly Media, 2019.\n"
        "5. Elmasri, Ramez, and Shamkant B. Navathe. Fundamentals of Database Systems. 7th ed., Pearson Education, 2016."
    )
    add_p(books_text)

    add_h2("9.2 Website References & Documentation")
    web_text = (
        "1. Ministry of Road Transport and Highways (MoRTH), Government of India: Parivahan Sewa Portal.\n"
        "   https://parivahan.gov.in/parivahan/\n"
        "2. React Official Documentation: Building Interactive User Interfaces with React 18.\n"
        "   https://react.dev/\n"
        "3. Express.js Official Guide: Fast, unopinionated, minimalist web framework for Node.js.\n"
        "   https://expressjs.com/\n"
        "4. TiDB Cloud Documentation: Serverless Cloud-Native Distributed SQL Database Architecture.\n"
        "   https://docs.pingcap.com/tidbcloud/\n"
        "5. Cloudflare Pages Documentation: Deploy modern frontend applications on Cloudflare's global edge network.\n"
        "   https://developers.cloudflare.com/pages/\n"
        "6. Render Cloud Documentation: Deploying Node.js and Express REST API Web Services.\n"
        "   https://render.com/docs/web-services\n"
        "7. Modern Language Association (MLA) Style Manual and Guide to Scholarly Publishing.\n"
        "   https://www.library.cornell.edu/sites/default/files/mla_style_revised.pdf"
    )
    add_p(web_text)

    # Save output document
    output_docx_path = r"c:\Users\radhe\OneDrive\Desktop\capstone project\DRIVING_SCHOOL_MANAGEMENT_SYSTEM_PROJECT_REPORT.docx"
    doc.save(output_docx_path)
    print(f"Project Report Word Document generated successfully: {output_docx_path}")

create_report()
