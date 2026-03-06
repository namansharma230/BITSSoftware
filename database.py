from sqlalchemy import create_engine, text, MetaData, Table, Column, Integer, String, Boolean, DateTime
import json
import os
from datetime import date, datetime

# Use SQLite instead of PostgreSQL
DB_URL = "sqlite:///./reports.db"
import logging
logging.basicConfig(level=logging.DEBUG)
engine = create_engine(DB_URL)

# Create tables if they don't exist
metadata = MetaData()

reports = Table(
    "reports", metadata,
    Column("id", String, primary_key=True),
    Column("exam_date", String),
    Column("exam_city", String),
    Column("student_name", String),
    Column("bits_id", String),
    Column("course_code", String),
    Column("course_name", String),
    Column("semester", String),
    Column("room_no", String),
    Column("answer_booklet_serial", String),
    Column("unfair_means", String),  # JSON string
    Column("evidence_collected", Boolean),
    Column("incident_details", String),
    Column("incident_datetime", String),
    Column("observer_name", String),
    Column("observer_mobile", String),
    Column("invigilator_name", String),
    Column("invigilator_mobile", String),
    Column("report_date", String)
)

# Create tables
metadata.create_all(engine)

def insert_report(report):
    try:
        with engine.connect() as conn:
            stmt = text("""
                INSERT INTO reports (
                    id, exam_date, exam_city, student_name, bits_id,
                    course_code, course_name, semester, room_no,
                    answer_booklet_serial, unfair_means, evidence_collected,
                    incident_details, incident_datetime, observer_name,
                    observer_mobile, invigilator_name, invigilator_mobile, report_date
                ) VALUES (
                    :id, :exam_date, :exam_city, :student_name, :bits_id,
                    :course_code, :course_name, :semester, :room_no,
                    :answer_booklet_serial, :unfair_means, :evidence_collected,
                    :incident_details, :incident_datetime, :observer_name,
                    :observer_mobile, :invigilator_name, :invigilator_mobile, :report_date
                )
            """)

            report_dict = report.dict()
            # Ensure unfair_means is a list and serialize to JSON
            if not isinstance(report_dict['unfair_means'], list):
                report_dict['unfair_means'] = []
            report_dict['unfair_means'] = json.dumps(report_dict['unfair_means'])
            report_dict['evidence_collected'] = bool(report_dict['evidence_collected'])

            # Normalize date and datetime fields to ISO strings for SQLite String columns
            def normalize_dt(val):
                if isinstance(val, datetime):
                    return val.isoformat()
                if isinstance(val, date):
                    return val.isoformat()
                return val

            for key in ("exam_date", "incident_datetime", "report_date"):
                report_dict[key] = normalize_dt(report_dict.get(key))

            conn.execute(stmt, report_dict)
            conn.commit()
            print("✅ Inserted report:", report_dict)
    except Exception as e:
        print(f"Error inserting report: {e}")
        raise