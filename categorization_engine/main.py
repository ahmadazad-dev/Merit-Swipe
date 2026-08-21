import io
import os
import uuid
import tempfile
import traceback

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

from pipeline import run_pipeline_pdf
from extract import extract_transactions
from transform import transform_transactions
from recommender import OrchestratorAgent

app = FastAPI(title="MeritSwipe Categorization Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.post("/api/transactions/analyze")
async def analyze(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds the 10 MB limit.")

    suffix = f"_{uuid.uuid4().hex}.csv"
    tmp_path = os.path.join(tempfile.gettempdir(), suffix)

    try:
        with open(tmp_path, "wb") as f:
            f.write(contents)

        pdf_buf: io.BytesIO = run_pipeline_pdf(tmp_path)

    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Pipeline error: {exc}")

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    safe_name = file.filename.replace(" ", "_").replace(".csv", "")
    headers = {
        "Content-Disposition": f'attachment; filename="{safe_name}_report.pdf"',
        "Access-Control-Expose-Headers": "Content-Disposition",
    }

    return StreamingResponse(
        pdf_buf,
        media_type="application/pdf",
        headers=headers,
    )


@app.post("/api/transactions/recommend")
async def recommend_cards(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds the 10 MB limit.")

    suffix = f"_{uuid.uuid4().hex}.csv"
    tmp_path = os.path.join(tempfile.gettempdir(), suffix)

    try:
        with open(tmp_path, "wb") as f:
            f.write(contents)

        raw_transactions = extract_transactions(tmp_path)
        categorized_transactions = transform_transactions(raw_transactions)

        orchestrator = OrchestratorAgent()
        top_cards = orchestrator.get_top_cards(categorized_transactions)

        return JSONResponse(
            content={
                "status": "success",
                "message": "Top 10 cards generated successfully based on user spending.",
                "recommendations": top_cards,
            }
        )

    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Recommendation error: {exc}")

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
