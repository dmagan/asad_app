from dotenv import load_dotenv
import os

load_dotenv()
username = os.getenv("SMS_USERNAME")
password = os.getenv("SMS_PASSWORD")
