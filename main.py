from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or more restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get PRODUCTION value from environment variables
PRODUCTION = os.getenv("PRODUCTION", "False").lower() == "true"

if PRODUCTION:
    app.mount("/", StaticFiles(directory="client/dist", html=True), name="static")


@app.get("/api/hello")
def read_root():
    return {"message": "Hello from FastAPI!"}
