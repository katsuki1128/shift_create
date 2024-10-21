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
from datetime import datetime


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


@employee_bp.route("/update_shift_times", methods=["POST"])
def update_shift_times():
    data = request.get_json()

    # リクエストから日付と時間を取得
    shift_date = data.get("date")
    new_start_time = data.get("start_time")
    new_end_time = data.get("end_time")
    print("test", new_start_time, new_end_time, shift_date)
    input()

    # 日付のフォーマットを合わせる
    shift_date = datetime.strptime(shift_date, "%Y-%m-%d").date()

    # データベースからシフトを取得
    shift = EmployeeShiftRequest.query.filter_by(date=shift_date).first()

    if shift:
        # シフトの開始時間と終了時間を更新
        shift.start_datetime = datetime.combine(
            shift.date, datetime.strptime(new_start_time, "%H:%M").time()
        )
        shift.end_datetime = datetime.combine(
            shift.date, datetime.strptime(new_end_time, "%H:%M").time()
        )
        db.session.commit()

        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "error": "Shift not found"}), 404
