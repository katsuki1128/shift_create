from flask_sqlalchemy import SQLAlchemy

# データベースオブジェクトを定義
db = SQLAlchemy()


# Employeeモデルを定義
class Employee(db.Model):
    __tablename__ = "employees"
    employee_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(50), nullable=False)
    max_consecutive_days = db.Column(db.Integer, nullable=False)
    max_days_per_week = db.Column(db.Integer, nullable=False)
