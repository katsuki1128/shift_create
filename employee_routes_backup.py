# employee_routes.py

from flask import (
    Blueprint,
    render_template,
    session,
    redirect,
    url_for,
    request,
    jsonify,
)

from models import db, Employee, EmployeeShiftRequest
from sqlalchemy import extract


employee_bp = Blueprint("employee", __name__)


# すべてのルートに対してログインを確認
@employee_bp.before_request
def require_login():
    if "username" not in session:
        return redirect(url_for("auth.login"))


# /employeeエンドポイントで従業員の基本情報だけを表示
@employee_bp.route("/employee")
def employee():
    # セッションからユーザー名を取得
    username = session.get("username")

    # ログインユーザーの従業員情報を取得
    employee = Employee.query.filter_by(username=username).first()

    # テンプレートに渡すデータを準備
    return render_template(
        "employee.html",
        username=username,
        full_name=employee.full_name,
        max_consecutive_days=employee.max_consecutive_days,
        max_days_per_week=employee.max_days_per_week,
    )


# 従業員の日毎のシフト情報を取得
@employee_bp.route("/get_login_employee_shifts")
def get_user_shifts():
    # セッションからユーザー名を取得
    username = session.get("username")

    # ログインユーザーのシフトデータを取得
    employee = Employee.query.filter_by(username=username).first()

    # リクエストパラメータからcurrentMonthを取得 (YYYY-MM形式)
    current_month = request.args.get("currentMonth")

    # currentMonthに基づいてその月のシフトリクエストを取得
    year, month = map(int, current_month.split("-"))
    shift_requests = EmployeeShiftRequest.query.filter(
        EmployeeShiftRequest.employee_id == employee.employee_id,
        extract("year", EmployeeShiftRequest.date) == year,
        extract("month", EmployeeShiftRequest.date) == month,
    ).all()

    print(len(shift_requests))

    # shift_requestsをシリアライズ可能な形式に変換
    login_employee_shifts = []
    for shift_request in shift_requests:
        login_employee_shifts.append(
            {
                "employee_id": shift_request.employee_id,
                "date": str(shift_request.date),
                "shift_id": shift_request.shift_id,
                "start_time": shift_request.start_datetime.strftime("%H:%M"),
                "end_time": shift_request.end_datetime.strftime("%H:%M"),
                "work_hours": shift_request.work_hours,
            }
        )
    print(len(login_employee_shifts))

    # シフトデータをJSON形式で返す
    return jsonify(login_employee_shifts)
