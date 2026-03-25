from werkzeug.security import generate_password_hash
from config.db import db
from datetime import datetime

email = "admin@neurocare.com"
password = "admin123"   # change after first login

existing = db.users.find_one({"email": email})

if existing:
    print("Admin already exists")
else:
    db.users.insert_one({
        "name": "System Admin",
        "email": email,
        "password": generate_password_hash(password),
        "role": "admin",
        "verified": True,
        "verification_status": "approved",
        "created_at": datetime.utcnow()
    })
    print("Admin created successfully")