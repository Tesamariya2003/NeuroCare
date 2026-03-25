from flask import Flask
from flask_cors import CORS
from flask import send_from_directory

from routes.parkinsons import parkinsons_bp
from routes.alzheimer import alzheimer_bp
from routes.users import users_bp
from routes.ms import ms_bp 
from config.db import db
from routes.doctor_dashboard import doctor_bp
from flask_jwt_extended import JWTManager
from routes.auth import auth_bp
from routes.cases import cases_bp
from routes.alzheimer_mri import alzheimer_mri_bp
from routes.admin import admin_bp
from routes.patient_routes import patient_bp


app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True
)

app.config["JWT_SECRET_KEY"] = "super-secret-key"
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

jwt = JWTManager(app)

app.register_blueprint(parkinsons_bp, url_prefix="/parkinsons")
app.register_blueprint(alzheimer_bp, url_prefix="/alzheimer")
app.register_blueprint(users_bp, url_prefix="/users")
app.register_blueprint(ms_bp)
app.register_blueprint(doctor_bp, url_prefix="/doctor")
app.register_blueprint(auth_bp)
app.register_blueprint(cases_bp)
app.register_blueprint(alzheimer_mri_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(patient_bp, url_prefix="/api/patient")

@app.route("/")
def home():
    return {"message": "Neurological Decision Support System API"}

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory("uploads", filename)
if __name__ == "__main__":    
    app.run(debug=True)
    
