import os
import tempfile
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from agent import run_agent

app = FastAPI()

# Retained your CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Updated endpoint to match the frontend and accept multipart/form-data
@app.post("/api/chat")
async def chat_endpoint(
    message: str = Form(...),
    file: UploadFile = File(None),
    user_id: Optional[str] = Form(None),
):
    temp_path = None

    # 1. Catch the file and save it temporarily
    if file and file.filename.endswith(".csv"):
        temp_path = os.path.join(tempfile.gettempdir(), file.filename)
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)

    try:
        # Convert user_id to int safely if provided
        parsed_user_id = int(user_id) if user_id else None

        # 2. Pass the message AND the temporary path to the agent
        agent_response = run_agent(
            user_input=message, user_id=parsed_user_id, uploaded_file_path=temp_path
        )

        # 3. Return mapped to "reply" to match mbot.jsx state expectations
        return {"reply": agent_response}

    finally:
        # 4. Always clean up the temporary file so your server doesn't get cluttered
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
