# app.py
import os
from flask import Flask, render_template, redirect, url_for, session, request, jsonify
from dotenv import load_dotenv
from models import db, User, Employee
from auth import auth

# .envファイルの環境変数をロード
load_dotenv()

# 環境変数からそれぞれの要素を取得
username = os.getenv("DB_USERNAME")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
dbname = os.getenv("DB_DATABASE")

# それらを結合して DATABASE_URL を作成
database_url = f"postgresql://{username}:{password}@{host}:{port}/{dbname}"

app = Flask(__name__)

# セッション管理のためにSECRET_KEYを設定
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# HerokuのPostgreSQLデータベースURLを設定（環境変数を使用して安全に取得可能）
app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# データベースの初期化（models.pyからインポートしたdbを使用）
db.init_app(app)

# auth.pyで定義したBlueprintを登録
app.register_blueprint(auth)


# ログイン画面を表示するルート
@app.route("/login")
def login():
    return render_template("login.html")


# ルートURLでユーザーデータを表示
@app.route("/")
def index():
    if "username" not in session:
        return redirect(
            url_for("login")
        )  # セッションにユーザーがいない場合ログイン画面にリダイレクト

    users = User.query.all()
    employees = Employee.query.all()  # employeesテーブルからデータを取得
    return render_template("index.html", users=users, employees=employees)


if __name__ == "__main__":
    app.run(debug=True)
