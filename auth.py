# auth.py
from flask import (
    Blueprint,
    request,
    session,
    jsonify,
    redirect,
    url_for,
    render_template,
)
from models import Employee

auth = Blueprint("auth", __name__)  # FlaskのBlueprintを使用して、認証関連の機能を分ける


# データベースからデータを読み込む汎用関数
def load_users():
    users = {}
    employees = Employee.query.all()
    for employee in employees:
        users[employee.username] = employee.password
    return users


@auth.route("/")
def home():
    return redirect(url_for("auth.login"))


# ログイン画面を表示するルート
@auth.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "POST":
        data = request.json
        username = data.get("username")
        password = data.get("password")

        users = load_users()
        if username in users and users[username] == password:
            session["username"] = username  # セッションにユーザー情報を保存
            return jsonify({"success": True})
        else:
            return (
                jsonify({"success": False, "message": "Invalid username or password"}),
                401,
            )
    # GETリクエストの場合はログインページを返す
    return render_template("login.html")


# ログアウト処理
@auth.route("/logout")
def logout():
    session.pop("username", None)  # セッションからユーザーを削除
    return redirect(url_for("auth.login"))
