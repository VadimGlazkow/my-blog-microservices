from fastapi import FastAPI, HTTPException
import requests
from pydantic import BaseModel
from decouple import config

app = FastAPI()

TELEGRAM_BOT_TOKEN = config("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = config("TELEGRAM_CHAT_ID")


class Notification(BaseModel):
    message: str


@app.post("/send-notification")
async def send_notification(notification: Notification):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": notification.message,
        "parse_mode": "HTML"
    }
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return {"status": "success", "message": "Notification sent"}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to send notification: {str(e)}")