from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import date, datetime


class Report(BaseModel):

    id: int
    exam_date: date
    exam_city: str
    student_name: str
    bits_id: str
    course_code: str
    course_name: str
    semester: str
    room_no: str
    answer_booklet_serial: str
    unfair_means: List[str]
    evidence_collected: bool
    incident_details: str
    incident_datetime: datetime
    observer_name: str
    observer_mobile: str
    invigilator_name: str
    invigilator_mobile: str
    report_date: date

    @validator("evidence_collected", pre=True)
    def parse_evidence_collected(cls, value):
        if isinstance(value, str):
            return value.lower() in ("true", "on", "1")
        return bool(value)
