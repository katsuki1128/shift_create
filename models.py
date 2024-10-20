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


class Shift(db.Model):
    __tablename__ = "shifts"
    shift_id = db.Column(db.Integer, primary_key=True)
    shift_name = db.Column(db.String(50), unique=True, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    hamabo_name = db.Column(db.String(50), nullable=False)
    senjyu_name = db.Column(db.String(50), nullable=False)


class EmployeeShiftRequest(db.Model):
    __tablename__ = "employee_shift_requests"
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(
        db.Integer, db.ForeignKey("employees.employee_id"), nullable=False
    )
    date = db.Column(db.Date, nullable=False)
    shift_id = db.Column(db.Integer, db.ForeignKey("shifts.shift_id"), nullable=False)
    start_datetime = db.Column(db.DateTime, nullable=False)  # 変更
    end_datetime = db.Column(db.DateTime, nullable=False)  # 変更
    work_hours = db.Column(db.Integer, nullable=False, default=4)  # デフォルト値を設定

    employee = db.relationship(
        "Employee", backref=db.backref("employee_shift_requests", lazy=True)
    )
    shift = db.relationship(
        "Shift", backref=db.backref("employee_shift_requests", lazy=True)
    )
