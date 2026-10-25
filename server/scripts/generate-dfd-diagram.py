import os
from PIL import Image, ImageDraw, ImageFont

def generate_dfd_level1():
    width = 3400
    height = 2500
    bg_color = (255, 255, 255)
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Fonts
    font_dir = "C:/Windows/Fonts"
    title_font = ImageFont.truetype(os.path.join(font_dir, "timesbd.ttf"), 54)
    subtitle_font = ImageFont.truetype(os.path.join(font_dir, "times.ttf"), 32)
    entity_font = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 30)
    proc_num_font = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 22)
    proc_title_font = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 26)
    store_font = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 22)
    flow_font = ImageFont.truetype(os.path.join(font_dir, "arial.ttf"), 20)
    flow_bold = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 20)
    legend_font = ImageFont.truetype(os.path.join(font_dir, "arial.ttf"), 24)

    # Palette
    c_title = (30, 58, 138)
    c_entity_fill = (224, 231, 255)      # Light Indigo
    c_entity_border = (67, 56, 202)      # Deep Indigo
    c_proc_fill = (240, 253, 250)        # Light Teal/Cyan
    c_proc_border = (13, 148, 136)       # Teal Border
    c_proc_hdr = (15, 118, 110)
    c_store_fill = (254, 243, 199)       # Amber/Yellow
    c_store_border = (217, 119, 6)
    c_line = (51, 65, 85)
    c_text = (15, 23, 42)

    # Title Box
    draw.rectangle([(60, 40), (width - 60, 160)], fill=(241, 245, 249), outline=(203, 213, 225), width=2)
    draw.text((width // 2, 75), "DRIVING SCHOOL MANAGEMENT SYSTEM", fill=c_title, font=title_font, anchor="mm")
    draw.text((width // 2, 125), "Figure 4.3: First Level Data Flow Diagram (Level 1 DFD — Gane & Sarson / Yourdon Notation)", fill=(71, 85, 105), font=subtitle_font, anchor="mm")

    # 1. External Entities (Left & Right columns)
    # [Student/Learner, Administrator, Certified Instructor]
    entities = {
        "STUDENT": {"x": 100, "y": 700, "w": 380, "h": 220, "label": "EXTERNAL ENTITY:\nSTUDENT / LEARNER"},
        "INSTRUCTOR": {"x": 100, "y": 1400, "w": 380, "h": 220, "label": "EXTERNAL ENTITY:\nCERTIFIED INSTRUCTOR"},
        "ADMIN": {"x": 2920, "y": 1000, "w": 380, "h": 240, "label": "EXTERNAL ENTITY:\nCHIEF ADMINISTRATOR"}
    }

    for k, ent in entities.items():
        x, y, w, h = ent["x"], ent["y"], ent["w"], ent["h"]
        # Double border rectangle for external entity
        draw.rectangle([(x, y), (x + w, y + h)], fill=c_entity_fill, outline=c_entity_border, width=4)
        draw.rectangle([(x + 8, y + 8), (x + w - 8, y + h - 8)], outline=c_entity_border, width=2)
        draw.text((x + w // 2, y + h // 2), ent["label"], fill=c_entity_border, font=entity_font, anchor="mm", align="center")

    # 2. Level 1 Processes (Central Column)
    processes = [
        {"id": "1.0", "title": "User Authentication\n& Role Verification", "x": 800, "y": 250, "w": 460, "h": 170},
        {"id": "2.0", "title": "Course Enrollment &\n100% Upfront Billing", "x": 800, "y": 550, "w": 460, "h": 170},
        {"id": "3.0", "title": "Conflict-Free Slot\nScheduling Engine", "x": 800, "y": 920, "w": 460, "h": 180},
        {"id": "4.0", "title": "Practical Attendance &\nOdometer Logging", "x": 800, "y": 1330, "w": 460, "h": 180},
        {"id": "5.0", "title": "RTO Mock Examination\n& Automated Grading", "x": 800, "y": 1720, "w": 460, "h": 180},
        {"id": "6.0", "title": "Executive Analytics &\nExcel Report Generator", "x": 2000, "y": 1000, "w": 480, "h": 180}
    ]

    for p in processes:
        x, y, w, h = p["x"], p["y"], p["w"], p["h"]
        # Rounded rectangle for process
        draw.rounded_rectangle([(x, y), (x + w, y + h)], radius=20, fill=c_proc_fill, outline=c_proc_border, width=4)
        # Header strip for process ID
        draw.rounded_rectangle([(x, y), (x + w, y + 46)], radius=20, fill=c_proc_hdr)
        draw.rectangle([(x, y + 25), (x + w, y + 46)], fill=c_proc_hdr)
        draw.text((x + w // 2, y + 22), f"PROCESS {p['id']}", fill=(255, 255, 255), font=proc_num_font, anchor="mm")
        # Process title
        draw.text((x + w // 2, y + 105), p["title"], fill=(15, 23, 42), font=proc_title_font, anchor="mm", align="center")

    # 3. Data Stores (Central-Right column)
    # Open-ended rectangles (parallel horizontal lines)
    data_stores = [
        {"id": "D1", "name": "UserMaster (Profiles & Auth)", "x": 1500, "y": 280, "w": 440, "h": 110},
        {"id": "D2", "name": "CourseMaster (Curriculum & Fees)", "x": 1500, "y": 480, "w": 440, "h": 110},
        {"id": "D3", "name": "PaymentMaster (100% Invoices)", "x": 1500, "y": 680, "w": 440, "h": 110},
        {"id": "D4", "name": "BookingMaster (Driving Slots)", "x": 1500, "y": 880, "w": 440, "h": 110},
        {"id": "D5", "name": "VehicleMaster (Dual-Control Fleet)", "x": 1500, "y": 1080, "w": 440, "h": 110},
        {"id": "D6", "name": "InstructorMaster (Trainers & Salary)", "x": 1500, "y": 1280, "w": 440, "h": 110},
        {"id": "D7", "name": "AttendanceMaster (Odometer & Rating)", "x": 1500, "y": 1480, "w": 440, "h": 110},
        {"id": "D8", "name": "TestScheduleMaster (RTO Scores)", "x": 1500, "y": 1750, "w": 440, "h": 110}
    ]

    for ds in data_stores:
        x, y, w, h = ds["x"], ds["y"], ds["w"], ds["h"]
        # Background
        draw.rectangle([(x, y), (x + w, y + h)], fill=c_store_fill)
        # Top and bottom parallel lines (standard DFD store notation)
        draw.line([(x, y), (x + w, y)], fill=c_store_border, width=4)
        draw.line([(x, y + h), (x + w, y + h)], fill=c_store_border, width=4)
        # Left bar for ID
        draw.line([(x + 65, y), (x + 65, y + h)], fill=c_store_border, width=2)
        draw.text((x + 32, y + h // 2), ds["id"], fill=c_store_border, font=entity_font, anchor="mm")
        draw.text((x + 80, y + h // 2), ds["name"], fill=c_text, font=store_font, anchor="lm")

    # Helper function to draw directional arrow with label
    def draw_flow_arrow(points, label, label_pos=None, text_align="center", arrow_dir="right"):
        # Draw path
        for i in range(len(points) - 1):
            draw.line([points[i], points[i+1]], fill=c_line, width=3)

        # Draw arrowhead at the end point
        end_pt = points[-1]
        prev_pt = points[-2]
        size = 14
        if arrow_dir == "right" or (end_pt[0] > prev_pt[0] and end_pt[1] == prev_pt[1]):
            arrow = [(end_pt[0], end_pt[1]), (end_pt[0] - size, end_pt[1] - size // 2), (end_pt[0] - size, end_pt[1] + size // 2)]
        elif arrow_dir == "left" or (end_pt[0] < prev_pt[0] and end_pt[1] == prev_pt[1]):
            arrow = [(end_pt[0], end_pt[1]), (end_pt[0] + size, end_pt[1] - size // 2), (end_pt[0] + size, end_pt[1] + size // 2)]
        elif arrow_dir == "down" or (end_pt[1] > prev_pt[1] and end_pt[0] == prev_pt[0]):
            arrow = [(end_pt[0], end_pt[1]), (end_pt[0] - size // 2, end_pt[1] - size), (end_pt[0] + size // 2, end_pt[1] - size)]
        elif arrow_dir == "up" or (end_pt[1] < prev_pt[1] and end_pt[0] == prev_pt[0]):
            arrow = [(end_pt[0], end_pt[1]), (end_pt[0] - size // 2, end_pt[1] + size), (end_pt[0] + size // 2, end_pt[1] + size)]
        else:
            arrow = [(end_pt[0], end_pt[1]), (end_pt[0] - size, end_pt[1] - size // 2), (end_pt[0] - size, end_pt[1] + size // 2)]
        draw.polygon(arrow, fill=c_line)

        # Draw label
        if label_pos:
            lx, ly = label_pos
            # Background pill for readability
            bbox = draw.textbbox((lx, ly), label, font=flow_font, anchor="mm")
            draw.rounded_rectangle([(bbox[0] - 6, bbox[1] - 4), (bbox[2] + 6, bbox[3] + 4)], radius=6, fill=(255, 255, 255), outline=(203, 213, 225), width=1)
            draw.text((lx, ly), label, fill=c_text, font=flow_font, anchor="mm")

    # --- 4. Draw Data Flows ---
    # Flow 1: Student -> Process 1.0 (Login Credentials)
    draw_flow_arrow([(290, 700), (290, 310), (800, 310)], "Login Credentials (Email, Pass)", (540, 290), arrow_dir="right")
    # Flow 2: Process 1.0 -> D1 UserMaster (Validate & Read)
    draw_flow_arrow([(1260, 310), (1500, 310)], "Verify User & Salted Hash", (1380, 290), arrow_dir="right")
    # Flow 3: Process 1.0 -> Student (JWT Bearer Token & Role)
    draw_flow_arrow([(800, 360), (340, 360), (340, 700)], "JWT Bearer Token & User Profile", (540, 380), arrow_dir="down")

    # Flow 4: Student -> Process 2.0 (Course Selection & 100% Fee)
    draw_flow_arrow([(480, 750), (600, 750), (600, 610), (800, 610)], "Course Selection & UPI Fee Payment", (620, 640), arrow_dir="right")
    # Flow 5: Process 2.0 -> D2 CourseMaster (Fetch Fee)
    draw_flow_arrow([(1260, 570), (1500, 530)], "Fetch Course Fee & Details", (1380, 530), arrow_dir="right")
    # Flow 6: Process 2.0 -> D3 PaymentMaster (Save 100% Cleared Payment)
    draw_flow_arrow([(1260, 640), (1500, 700)], "Save Cleared Payment (Bal: 0.00)", (1380, 690), arrow_dir="right")
    # Flow 7: Process 2.0 -> Student (PDF Receipt Download)
    draw_flow_arrow([(800, 670), (540, 670), (540, 780), (480, 780)], "Official GST PDF Receipt (INV-2026)", (620, 690), arrow_dir="left")

    # Flow 8: Student -> Process 3.0 (Slot Preference & Start Date)
    draw_flow_arrow([(480, 830), (640, 830), (640, 970), (800, 970)], "Preferred Slot (e.g. 7-8 AM) & Date", (640, 900), arrow_dir="right")
    # Flow 9: Process 3.0 -> D4 BookingMaster (Create Pending Slot)
    draw_flow_arrow([(1260, 970), (1500, 930)], "Store Pending Booking Record", (1380, 930), arrow_dir="right")

    # Flow 10: Admin -> Process 3.0 (Finalize Slot & Assign Trainer/Car)
    draw_flow_arrow([(2920, 1080), (2700, 1080), (2700, 1030), (1260, 1030)], "Finalize Slot & Assign Instructor/Car", (2100, 950), arrow_dir="left")
    # Flow 11: Process 3.0 <-> D5 VehicleMaster & D6 InstructorMaster (Collision Verification)
    draw_flow_arrow([(1260, 1060), (1500, 1120)], "Check Vehicle Availability", (1380, 1070), arrow_dir="right")
    draw_flow_arrow([(1260, 1080), (1450, 1080), (1450, 1310), (1500, 1310)], "Check Instructor Clash", (1370, 1240), arrow_dir="right")

    # Flow 12: Instructor -> Process 4.0 (Mark Attendance & Odometer KM)
    draw_flow_arrow([(480, 1460), (620, 1460), (620, 1390), (800, 1390)], "Attendance, Odometer KM & Rating (1-5)", (640, 1410), arrow_dir="right")
    # Flow 13: Process 4.0 -> D7 AttendanceMaster (Save Practical Log)
    draw_flow_arrow([(1260, 1420), (1500, 1510)], "Commit Practical Driving Log", (1380, 1445), arrow_dir="right")
    # Flow 14: Process 4.0 -> Student (View 360 Progress & Driving Feedback)
    draw_flow_arrow([(800, 1450), (420, 1450), (420, 920)], "Instructor Feedback & Rating", (540, 1200), arrow_dir="up")

    # Flow 15: Student -> Process 5.0 (Submit RTO Exam Answers)
    draw_flow_arrow([(380, 920), (380, 1780), (800, 1780)], "Submit RTO Quiz Answers (Papers 1-6)", (560, 1760), arrow_dir="right")
    # Flow 16: Process 5.0 -> D8 TestScheduleMaster (Save Score & Pass/Fail)
    draw_flow_arrow([(1260, 1790), (1500, 1790)], "Log Exam Score & Evaluation", (1380, 1770), arrow_dir="right")
    # Flow 17: Process 5.0 -> Student (Instant Results & Explanations)
    draw_flow_arrow([(800, 1840), (320, 1840), (320, 920)], "Instant Score (%), Pass/Fail & Review", (520, 1860), arrow_dir="up")

    # Flow 18: Admin -> Process 6.0 (Request Roster & Financial Report)
    draw_flow_arrow([(2920, 1140), (2480, 1140)], "Request Student Roster / Revenue Audit", (2700, 1120), arrow_dir="left")
    # Flow 19: Process 6.0 reads D1, D3, D4, D6, D7
    draw_flow_arrow([(1940, 720), (2180, 720), (2180, 1000)], "Aggregate Fees & Student Profiles", (2060, 700), arrow_dir="down")
    # Flow 20: Process 6.0 -> Admin (Excel .xlsx Stream Download)
    draw_flow_arrow([(2480, 1070), (2920, 1070)], "Audit-Ready Excel Reports (.xlsx)", (2700, 1050), arrow_dir="right")

    # 5. Legend & Notation Footer Box
    legend_y = 2320
    draw.rounded_rectangle([(60, legend_y), (width - 60, legend_y + 130)], radius=12, fill=(248, 250, 252), outline=(203, 213, 225), width=2)
    draw.text((120, legend_y + 35), "DATA FLOW DIAGRAM (DFD LEVEL 1) NOTATION CONVENTIONS:", fill=(15, 23, 42), font=entity_font)

    # External Entity symbol in legend
    draw.rectangle([(120, legend_y + 75), (170, legend_y + 105)], fill=c_entity_fill, outline=c_entity_border, width=2)
    draw.text((180, legend_y + 78), "External Entity (Actor)", fill=c_text, font=legend_font)

    # Process symbol in legend
    draw.rounded_rectangle([(520, legend_y + 75), (570, legend_y + 105)], radius=6, fill=c_proc_fill, outline=c_proc_border, width=2)
    draw.text((580, legend_y + 78), "Level 1 Process (Subsystem)", fill=c_text, font=legend_font)

    # Data Store symbol in legend
    draw.line([(960, legend_y + 78), (1010, legend_y + 78)], fill=c_store_border, width=3)
    draw.line([(960, legend_y + 105), (1010, legend_y + 105)], fill=c_store_border, width=3)
    draw.text((1020, legend_y + 78), "Data Store (Database Table)", fill=c_text, font=legend_font)

    # Data flow arrow in legend
    draw.line([(1440, legend_y + 90), (1490, legend_y + 90)], fill=c_line, width=3)
    draw.polygon([(1490, legend_y + 90), (1478, legend_y + 83), (1478, legend_y + 97)], fill=c_line)
    draw.text((1505, legend_y + 78), "Data Flow (Packet / Message)", fill=c_text, font=legend_font)

    draw.text((2300, legend_y + 78), "College: COCSIT Latur | SRTMUN BCA Capstone 2025-26", fill=c_title, font=proc_title_font)

    # Save output
    output_path = r"c:\Users\radhe\OneDrive\Desktop\capstone project\dfd_level1_diagram.png"
    img.save(output_path, "PNG", dpi=(300, 300))
    print(f"Level 1 DFD generated successfully at: {output_path}")

generate_dfd_level1()
