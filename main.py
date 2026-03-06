from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Report
from database import insert_report, engine
from sqlalchemy import text
from SentimentalAnalysis.sentiment import analyze_sentiment
from typing import List
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import json
import os
import logging

from fastapi import Request
from fastapi.staticfiles import StaticFiles

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Mount the Frontend directory as static files
frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Frontend")

app = FastAPI()

# Mount static files under /static to avoid shadowing API routes
app.mount("/static", StaticFiles(directory=frontend_dir, html=True), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve entry pages explicitly
@app.get("/")
def serve_index():
    return FileResponse(os.path.join(frontend_dir, "Index.html"))

@app.get("/dashboard.html")
def serve_dashboard():
    return FileResponse(os.path.join(frontend_dir, "dashboard.html"))

# Simple health endpoint for quick checks
@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.post("/submit-report")
@app.options("/submit-report")
async def submit_report(report: Report = None, request: Request = None):
    # Handle OPTIONS request
    if request and request.method == "OPTIONS":
        return {}

    if not report:
        return JSONResponse(status_code=400, content={"message": "No report data provided"})

    try:
        logger.debug(f"Received report: {report.dict()}")
        insert_report(report)
        return {"message": "Report submitted successfully"}
    except Exception as e:
        logger.error(f"Error in submit_report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to submit report: {str(e)}")


# Seed a sample report for testing without browser interaction
from datetime import date, datetime
import time

@app.get("/seed-sample")
def seed_sample():
    try:
        sample = Report(
            id=int(time.time_ns()),
            exam_date=date(2024, 11, 1),
            exam_city="Test City",
            student_name="Alice",
            bits_id="B1234",
            course_code="CS101",
            course_name="Intro",
            semester="1",
            room_no="R1",
            answer_booklet_serial="ABC123",
            unfair_means=["talking"],
            evidence_collected=True,
            incident_details="Student was caught talking; severe cheating attempt",
            incident_datetime=datetime(2024, 11, 1, 10, 0, 0),
            observer_name="Bob",
            observer_mobile="1234567890",
            invigilator_name="Eve",
            invigilator_mobile="0987654321",
            report_date=date(2024, 11, 1),
        )
        insert_report(sample)
        return {"message": "seeded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to seed sample: {str(e)}")


@app.get("/reports-with-sentiment")
@app.options("/reports-with-sentiment")
async def get_reports_with_sentiment(request: Request = None):
    # Handle OPTIONS request
    if request and request.method == "OPTIONS":
        return {}

    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT * FROM reports"))
            reports = []
            for row in result:
                report_dict = {column: value for column, value in zip(result.keys(), row)}

                # Convert JSON string to Python object if needed
                if isinstance(report_dict.get('unfair_means'), str):
                    try:
                        report_dict['unfair_means'] = json.loads(report_dict['unfair_means'])
                    except:
                        pass

                # Add sentiment analysis — always derived from incident_details
                if report_dict.get('incident_details'):
                    sentiment = analyze_sentiment(report_dict['incident_details'])
                    report_dict['sentiment'] = sentiment
                else:
                    report_dict['sentiment'] = 'neutral'

                reports.append(report_dict)

            return JSONResponse(content=reports)
    except Exception as e:
        logger.error(f"Error in get_reports_with_sentiment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch reports: {str(e)}")


@app.get("/reports")
async def get_reports():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM reports"))
            reports = []
            for row in result:
                row_dict = dict(row._mapping)
                # Parse unfair_means string back to list
                if isinstance(row_dict.get("unfair_means"), str) and row_dict["unfair_means"].strip():
                    try:
                        row_dict["unfair_means"] = json.loads(row_dict["unfair_means"])
                    except json.JSONDecodeError as e:
                        print(f"Failed to parse unfair_means: {row_dict['unfair_means']} → {e}")
                        row_dict["unfair_means"] = []
                reports.append(row_dict)
            return reports
    except Exception as e:
        print("ERROR in get_reports:", e)
        raise HTTPException(status_code=500, detail=f"Failed to fetch reports: {str(e)}")


class AnalyzeRequest(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_text(payload: AnalyzeRequest):
    """Analyze raw text and return a simple sentiment with confidence.

    Uses the existing `analyze_sentiment` helper. Confidence is heuristic:
    higher for positive/negative, lower for neutral.
    """
    try:
        label = analyze_sentiment(payload.text)  # returns 'positive' | 'negative' | 'neutral'
        confidence = 0.75 if label in ("positive", "negative") else 0.5
        return {"sentiment": label, "confidence": confidence}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")


@app.get("/sentiment-analysis")
async def get_sentiment_analysis():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT id, incident_details, incident_datetime, exam_date FROM reports"))
            sentiment_data = []
            for row in result:
                row_dict = dict(row._mapping)
                # Sentiment is derived from incident_details
                label = analyze_sentiment(row_dict["incident_details"])
                score = 0.75 if label in ("positive", "negative") else 0.5
                sentiment_data.append({
                    "id": row_dict["id"],
                    "incident_details": row_dict["incident_details"],
                    "incident_datetime": row_dict["incident_datetime"],
                    "exam_date": row_dict["exam_date"],
                    "sentiment": label,
                    "score": score,
                })
            return sentiment_data
    except Exception as e:
        print("ERROR in get_sentiment_analysis:", e)
        raise HTTPException(status_code=500, detail=f"Failed to fetch sentiment analysis: {str(e)}")


@app.post("/add-incident/")
def analyze_incidents(incidents: List[Report]):
    return {"message": f"Received {len(incidents)} incidents for analysis."}