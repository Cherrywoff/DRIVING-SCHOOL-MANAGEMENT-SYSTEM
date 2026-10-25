import os
from PIL import Image, ImageDraw, ImageFont

def generate_er_diagram():
    # Canvas Size: 3200 x 2400 (Ultra High Definition for printing)
    width = 3400
    height = 2500
    bg_color = (255, 255, 255) # Clean White
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Fonts
    font_dir = "C:/Windows/Fonts"
    title_font = ImageFont.truetype(os.path.join(font_dir, "timesbd.ttf"), 54)
    subtitle_font = ImageFont.truetype(os.path.join(font_dir, "times.ttf"), 32)
    entity_title_font = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 28)
    attr_font = ImageFont.truetype(os.path.join(font_dir, "arial.ttf"), 21)
    attr_bold = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 21)
    rel_font = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 20)
    card_font = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 24)
    legend_font = ImageFont.truetype(os.path.join(font_dir, "arial.ttf"), 24)

    # Colors
    c_header = (30, 58, 138)        # Navy Blue
    c_header_text = (255, 255, 255) # White
    c_border = (148, 163, 184)      # Slate Border
    c_pk = (185, 28, 28)            # Red for PK
    c_fk = (2, 132, 199)            # Sky Blue for FK
    c_attr = (30, 41, 59)           # Dark Slate Text
    c_line = (51, 65, 85)           # Dark Line
    c_badge_bg = (241, 245, 249)    # Light Gray for Relationship Badge
    c_card_bg = (248, 250, 252)

    # Title Bar
    draw.rectangle([(60, 40), (width - 60, 160)], fill=(241, 245, 249), outline=(203, 213, 225), width=2)
    draw.text((width // 2, 75), "DRIVING SCHOOL MANAGEMENT SYSTEM", fill=(30, 58, 138), font=title_font, anchor="mm")
    draw.text((width // 2, 125), "Figure 4.2: Comprehensive Entity-Relationship (E-R) Diagram (Relational Crow's Foot Schema)", fill=(71, 85, 105), font=subtitle_font, anchor="mm")

    # Define Entities with Positions and Attributes
    # (x, y, w, h, name, attributes [(type_flag, name, type_str)])
    entities = {
        "USER": {
            "x": 100, "y": 240, "w": 460, "h": 500,
            "title": "UserMaster (User)",
            "attrs": [
                ("PK", "UserID", "INT (PK)"),
                ("", "FullName", "VARCHAR(150)"),
                ("", "Email", "VARCHAR(150) [UK]"),
                ("", "PasswordHash", "VARCHAR(255)"),
                ("", "Role", "ENUM('Admin','Instructor','Student')"),
                ("", "Phone", "VARCHAR(20)"),
                ("", "LLRNumber", "VARCHAR(50) [RTO LLR]"),
                ("", "Address", "TEXT"),
                ("", "Status", "ENUM('Active','Inactive')"),
                ("", "CreatedAt", "TIMESTAMP")
            ]
        },
        "INSTRUCTOR": {
            "x": 800, "y": 240, "w": 480, "h": 460,
            "title": "InstructorMaster (Instructor)",
            "attrs": [
                ("PK", "InstructorID", "INT (PK)"),
                ("FK", "UserID", "INT (FK -> User) [UK]"),
                ("", "LicenseNumber", "VARCHAR(50) [RTO Badge]"),
                ("", "LicenseExpiryDate", "DATE"),
                ("", "Specialization", "VARCHAR(100)"),
                ("", "ExperienceYears", "INT"),
                ("FK", "AssignedVehicleID", "INT (FK -> Vehicle)"),
                ("", "Salary", "DECIMAL(10,2) [Monthly]"),
                ("", "Status", "ENUM('Active','OnLeave')")
            ]
        },
        "VEHICLE": {
            "x": 1540, "y": 240, "w": 470, "h": 460,
            "title": "VehicleMaster (Vehicle Fleet)",
            "attrs": [
                ("PK", "VehicleID", "INT (PK)"),
                ("", "RegistrationNumber", "VARCHAR(30) [UK]"),
                ("", "ModelType", "VARCHAR(100)"),
                ("", "Category", "ENUM('2W','4W','Commercial')"),
                ("", "Transmission", "ENUM('Manual','Automatic')"),
                ("", "HasDualControl", "TINYINT(1) [Dual Pedals]"),
                ("", "FitnessExpiryDate", "DATE"),
                ("", "InsuranceExpiryDate", "DATE"),
                ("", "Status", "ENUM('Available','InUse')")
            ]
        },
        "COURSE": {
            "x": 2260, "y": 240, "w": 460, "h": 470,
            "title": "CourseMaster (Driving Course)",
            "attrs": [
                ("PK", "CourseID", "INT (PK)"),
                ("", "CourseCode", "VARCHAR(30) [UK]"),
                ("", "CourseName", "VARCHAR(150)"),
                ("", "Category", "ENUM('MCWG','LMV-M','LMV-A','Combo')"),
                ("", "Description", "TEXT"),
                ("", "DurationDays", "INT (Calendar Days)"),
                ("", "TheoryHours", "INT"),
                ("", "PracticalHours", "INT"),
                ("", "Fee", "DECIMAL(10,2) [100% Upfront]"),
                ("", "Status", "ENUM('Active','Inactive')")
            ]
        },
        "SESSION_SLOT": {
            "x": 2860, "y": 240, "w": 440, "h": 360,
            "title": "SessionMaster (Daily Slots)",
            "attrs": [
                ("PK", "SessionID", "INT (PK)"),
                ("", "SessionName", "VARCHAR(100)"),
                ("", "StartTime", "TIME (e.g. 07:00:00)"),
                ("", "EndTime", "TIME (e.g. 08:00:00)"),
                ("", "CapacityPerSlot", "INT (Default 1)"),
                ("", "Status", "ENUM('Active','Inactive')")
            ]
        },
        "BOOKING": {
            "x": 1200, "y": 960, "w": 520, "h": 470,
            "title": "BookingMaster (Driving Sessions)",
            "attrs": [
                ("PK", "BookingID", "INT (PK)"),
                ("FK", "StudentID", "INT (FK -> User)"),
                ("FK", "CourseID", "INT (FK -> Course)"),
                ("FK", "InstructorID", "INT (FK -> Instructor) [Nullable]"),
                ("FK", "VehicleID", "INT (FK -> Vehicle) [Nullable]"),
                ("", "SessionDate", "DATE (Scheduled Date)"),
                ("", "TimeSlot", "VARCHAR(50) (e.g. 7-8 AM)"),
                ("", "Status", "ENUM('Pending','Scheduled','Completed')"),
                ("", "Notes", "TEXT (Preference / Feedback)")
            ]
        },
        "ATTENDANCE": {
            "x": 1200, "y": 1720, "w": 520, "h": 500,
            "title": "AttendanceMaster (Practical Log)",
            "attrs": [
                ("PK", "AttendanceID", "INT (PK)"),
                ("FK", "BookingID", "INT (FK -> Booking) [1:1]"),
                ("FK", "StudentID", "INT (FK -> User)"),
                ("FK", "InstructorID", "INT (FK -> Instructor)"),
                ("", "SessionDate", "DATE"),
                ("", "AttendanceStatus", "ENUM('Present','Absent','Late')"),
                ("", "KilometersDriven", "DECIMAL(5,2) [Odometer]"),
                ("", "TopicsCovered", "TEXT (Clutch/Reverse/Hill)"),
                ("", "CompetencyRating", "INT (CHECK 1-5 Stars)"),
                ("", "InstructorFeedback", "TEXT"),
                ("", "LoggedAt", "TIMESTAMP")
            ]
        },
        "PAYMENT": {
            "x": 300, "y": 1150, "w": 520, "h": 490,
            "title": "PaymentMaster (Fees Ledger)",
            "attrs": [
                ("PK", "PaymentID", "INT (PK)"),
                ("FK", "StudentID", "INT (FK -> User)"),
                ("FK", "CourseID", "INT (FK -> Course)"),
                ("", "InvoiceNumber", "VARCHAR(50) [INV-2026-xxxx]"),
                ("", "TotalAmount", "DECIMAL(10,2)"),
                ("", "AmountPaid", "DECIMAL(10,2) [100% Cleared]"),
                ("", "BalanceAmount", "DECIMAL(10,2) [Strictly 0.00]"),
                ("", "PaymentMethod", "ENUM('UPI','Cash','Card','NetB')"),
                ("", "TransactionReference", "VARCHAR(100) [UTR/TXN]"),
                ("", "PaymentStatus", "ENUM('Completed','Partial')"),
                ("", "PaymentDate", "TIMESTAMP")
            ]
        },
        "TEST": {
            "x": 2260, "y": 1150, "w": 520, "h": 490,
            "title": "TestScheduleMaster (RTO Exams)",
            "attrs": [
                ("PK", "TestID", "INT (PK)"),
                ("FK", "StudentID", "INT (FK -> User)"),
                ("FK", "CourseID", "INT (FK -> Course)"),
                ("", "TestType", "ENUM('Theory_Mock','Internal','Official_RTO')"),
                ("", "TestDate", "DATE"),
                ("", "TestTime", "TIME [Nullable for RTO]"),
                ("", "ScoreObtained", "DECIMAL(5,2) [Percentage]"),
                ("", "TotalScore", "DECIMAL(5,2) [100.00]"),
                ("", "ResultStatus", "ENUM('Scheduled','Passed','Failed')"),
                ("", "ExaminerOrInstructorNotes", "TEXT (RTO Notes)"),
                ("", "CreatedAt", "TIMESTAMP")
            ]
        }
    }

    # Draw Each Entity Box
    for key, ent in entities.items():
        x, y, w, h = ent["x"], ent["y"], ent["w"], ent["h"]
        # Card Background & Outer Border
        draw.rounded_rectangle([(x, y), (x + w, y + h)], radius=12, fill=(255, 255, 255), outline=(100, 116, 139), width=3)
        # Header Box
        header_h = 56
        draw.rounded_rectangle([(x, y), (x + w, y + header_h)], radius=12, fill=c_header)
        # Fix bottom corners of header
        draw.rectangle([(x, y + header_h - 12), (x + w, y + header_h)], fill=c_header)
        draw.text((x + w // 2, y + header_h // 2), ent["title"], fill=c_header_text, font=entity_title_font, anchor="mm")

        # Divider line
        draw.line([(x, y + header_h), (x + w, y + header_h)], fill=(100, 116, 139), width=2)

        # Draw Attributes
        curr_y = y + header_h + 16
        for tag, attr_name, attr_type in ent["attrs"]:
            # Icon / Tag
            if tag == "PK":
                draw.rectangle([(x + 16, curr_y - 2), (x + 56, curr_y + 24)], fill=(254, 226, 226), outline=c_pk, width=1)
                draw.text((x + 36, curr_y + 11), "PK", fill=c_pk, font=attr_bold, anchor="mm")
            elif tag == "FK":
                draw.rectangle([(x + 16, curr_y - 2), (x + 56, curr_y + 24)], fill=(224, 242, 254), outline=c_fk, width=1)
                draw.text((x + 36, curr_y + 11), "FK", fill=c_fk, font=attr_bold, anchor="mm")
            else:
                draw.ellipse([(x + 30, curr_y + 6), (x + 42, curr_y + 18)], fill=(148, 163, 184))

            # Name and Type
            name_font = attr_bold if tag in ["PK", "FK"] else attr_font
            name_color = c_pk if tag == "PK" else (c_fk if tag == "FK" else c_attr)
            draw.text((x + 68, curr_y + 1), attr_name, fill=name_color, font=name_font)
            # Type on the right or next to it
            draw.text((x + 230, curr_y + 1), f": {attr_type}", fill=(100, 116, 139), font=attr_font)
            curr_y += 38

    # Helper function to draw relationship connector with diamond
    def draw_relation(start_xy, end_xy, text_verb, card_start="1", card_end="N", mid_offset=(0, 0)):
        x1, y1 = start_xy
        x2, y2 = end_xy
        mx = (x1 + x2) // 2 + mid_offset[0]
        my = (y1 + y2) // 2 + mid_offset[1]

        # Draw stepped orthogonal path
        draw.line([(x1, y1), (mx, y1)], fill=c_line, width=4)
        draw.line([(mx, y1), (mx, y2)], fill=c_line, width=4)
        draw.line([(mx, y2), (x2, y2)], fill=c_line, width=4)

        # Draw Cardinality Labels
        draw.text((x1 + (25 if x2 >= x1 else -25), y1 - 25), card_start, fill=(15, 23, 42), font=card_font, anchor="mm")
        draw.text((x2 + (-25 if x2 >= x1 else 25), y2 - 25), card_end, fill=(15, 23, 42), font=card_font, anchor="mm")

        # Draw Relationship Diamond at center
        dw, dh = 85, 36
        diamond = [(mx, my - dh), (mx + dw, my), (mx, my + dh), (mx - dw, my)]
        draw.polygon(diamond, fill=(241, 245, 249), outline=(30, 58, 138), width=3)
        draw.text((mx, my), text_verb, fill=(30, 58, 138), font=rel_font, anchor="mm")

    # 1. User -> Instructor (1:1 "Assigned As")
    draw_relation((560, 470), (800, 470), "Assigned As", card_start="1", card_end="1", mid_offset=(0, 0))

    # 2. Vehicle -> Instructor (1:N "Drives / Allocated")
    draw_relation((1540, 470), (1280, 470), "Allocated To", card_start="1", card_end="N", mid_offset=(0, 0))

    # 3. User (Student) -> Booking (1:N "Enrolls / Books")
    # From User right edge (560, 600) to Booking left edge (1200, 1100)
    draw_relation((560, 600), (1200, 1100), "Enrolls / Books", card_start="1", card_end="N", mid_offset=(0, -60))

    # 4. Course -> Booking (1:N "Curriculum")
    # From Course left edge (2260, 580) to Booking right edge (1720, 1100)
    draw_relation((2260, 580), (1720, 1100), "Curriculum Of", card_start="1", card_end="N", mid_offset=(0, -60))

    # 5. Instructor -> Booking (1:N "Conducts")
    # From Instructor bottom (1040, 700) to Booking top (1360, 960)
    draw_relation((1040, 700), (1360, 960), "Conducts", card_start="1", card_end="N", mid_offset=(0, 0))

    # 6. Vehicle -> Booking (1:N "Assigned Car")
    # From Vehicle bottom (1775, 700) to Booking top (1560, 960)
    draw_relation((1775, 700), (1560, 960), "Assigned Car", card_start="1", card_end="N", mid_offset=(0, 0))

    # 7. Booking -> Attendance (1:1 "Logs Driving")
    # From Booking bottom (1460, 1430) to Attendance top (1460, 1720)
    draw_relation((1460, 1430), (1460, 1720), "Logs Driving", card_start="1", card_end="1", mid_offset=(0, 0))

    # 8. User (Student) -> Payment (1:N "Pays Fees")
    # From User bottom (330, 740) to Payment top (400, 1150)
    draw_relation((330, 740), (400, 1150), "Pays Fees", card_start="1", card_end="N", mid_offset=(0, 0))

    # 9. Course -> Payment (1:N "Billed For")
    # From Course bottom (2490, 710) over to Payment right (820, 1400)
    # Using orthogonal path via bottom of diagram
    draw_relation((2400, 710), (820, 1400), "Billed For", card_start="1", card_end="N", mid_offset=(-400, 250))

    # 10. User (Student) -> TestSchedule (1:N "Undertakes")
    # From User bottom (500, 740) to Test left (2260, 1400)
    draw_relation((500, 740), (2260, 1400), "Undertakes", card_start="1", card_end="N", mid_offset=(700, 240))

    # 11. Course -> TestSchedule (1:N "Examines")
    # From Course bottom (2550, 710) to Test top (2520, 1150)
    draw_relation((2550, 710), (2520, 1150), "Examines", card_start="1", card_end="N", mid_offset=(0, 0))

    # 12. Legend & Notation Footer Box
    legend_y = 2320
    draw.rounded_rectangle([(60, legend_y), (width - 60, legend_y + 130)], radius=12, fill=(248, 250, 252), outline=(203, 213, 225), width=2)
    draw.text((120, legend_y + 35), "DIAGRAM NOTATION & CARDINALITY CONVENTIONS:", fill=(15, 23, 42), font=attr_bold)

    # Key Items in Legend
    # PK Badge
    draw.rectangle([(120, legend_y + 75), (160, legend_y + 105)], fill=(254, 226, 226), outline=c_pk, width=2)
    draw.text((140, legend_y + 90), "PK", fill=c_pk, font=attr_bold, anchor="mm")
    draw.text((170, legend_y + 78), "Primary Key", fill=c_attr, font=legend_font)

    # FK Badge
    draw.rectangle([(360, legend_y + 75), (400, legend_y + 105)], fill=(224, 242, 254), outline=c_fk, width=2)
    draw.text((380, legend_y + 90), "FK", fill=c_fk, font=attr_bold, anchor="mm")
    draw.text((410, legend_y + 78), "Foreign Key Reference", fill=c_attr, font=legend_font)

    # Diamond
    mx_leg = 760
    my_leg = legend_y + 90
    draw.polygon([(mx_leg, my_leg - 18), (mx_leg + 45, my_leg), (mx_leg, my_leg + 18), (mx_leg - 45, my_leg)], fill=(241, 245, 249), outline=(30, 58, 138), width=2)
    draw.text((mx_leg, my_leg), "Verb", fill=(30, 58, 138), font=rel_font, anchor="mm")
    draw.text((mx_leg + 55, legend_y + 78), "Relationship Action", fill=c_attr, font=legend_font)

    # Cardinality
    draw.text((1150, legend_y + 78), "1 : 1 = One-to-One Strict Mapping", fill=c_attr, font=legend_font)
    draw.text((1680, legend_y + 78), "1 : N = One-to-Many Relational Dependency", fill=c_attr, font=legend_font)
    draw.text((2320, legend_y + 78), "System: COCSIT Latur / SRTMUN BCA Capstone 2025-26", fill=(30, 58, 138), font=attr_bold)

    # Save output
    output_path = r"c:\Users\radhe\OneDrive\Desktop\capstone project\er_diagram.png"
    img.save(output_path, "PNG", dpi=(300, 300))
    print(f"E-R Diagram generated successfully at: {output_path}")

generate_er_diagram()
