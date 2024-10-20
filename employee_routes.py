# employee_routes.py

from flask import Blueprint, render_template, session, redirect, url_for
from models import Employee

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

    # 従業員情報が存在する場合、フルネームや勤務時間などを取得
    if employee:
        full_name = employee.full_name
        max_consecutive_days = employee.max_consecutive_days
        max_days_per_week = employee.max_days_per_week
    else:
        full_name = "名前なし"  # エラーハンドリングとして空の値を設定
        max_consecutive_days = None
        max_days_per_week = None

    # 他の従業員リストもテンプレートに渡す
    employees = Employee.query.all()

    # テンプレートに渡すデータを準備
    return render_template(
        "employee.html",
        username=username,
        full_name=full_name,
        max_consecutive_days=max_consecutive_days,
        max_days_per_week=max_days_per_week,
        employees=employees,
    )
