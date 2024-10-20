# employee_routes.py

from flask import Blueprint, render_template, session, redirect, url_for, jsonify
from models import Employee, EmployeeShiftRequest

employee_bp = Blueprint("employee", __name__)


# すべてのルートに対してログインを確認
@employee_bp.before_request
def require_login():
    if "username" not in session:
        return redirect(url_for("auth.login"))


# /employeeエンドポイントで従業員リストを表示
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
        employees=Employee.query.all(),
    )


@employee_bp.route("/get_login_employee_shifts")
def get_user_shifts():
    # セッションからユーザー名を取得
    username = session.get("username")

    # ユーザーがログインしていない場合はエラーを返す
    if not username:
        return jsonify({"error": "User not logged in"}), 401

    # ログインユーザーのシフトデータを取得
    employee = Employee.query.filter_by(username=username).first()
    if not employee:
        return jsonify({"error": "User not found"}), 404

    # ユーザーのシフトリクエストを取得
    shift_requests = EmployeeShiftRequest.query.filter_by(
        employee_id=employee.employee_id
    ).all()

    # シフトデータを辞書形式に変換
    login_employee_shifts = {}
    for request in shift_requests:
        login_employee_shifts[str(request.date)] = {
            "shift_id": request.shift_id,
            "start_time": request.start_datetime.strftime("%H:%M"),
            "end_time": request.end_datetime.strftime("%H:%M"),
        }

    return jsonify(login_employee_shifts)
