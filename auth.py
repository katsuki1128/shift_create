from flask import Blueprint, request, session, jsonify
from models import Employee

auth = Blueprint("auth", __name__)  # FlaskのBlueprintを使用して、認証関連の機能を分ける


# データベースからデータを読み込む汎用関数
def load_users():
    users = {}
    employees = Employee.query.all()
    for employee in employees:
        users[employee.username] = employee.password
    return users


# ログイン処理
@auth.route("/login", methods=["POST"])
def login_post():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    users = load_users()
    print(users)
    if username in users and users[username] == password:
        session["username"] = username  # セッションにユーザー情報を保存
        return jsonify({"success": True})
    else:
        return (
            jsonify({"success": False, "message": "Invalid username or password"}),
            401,
        )
