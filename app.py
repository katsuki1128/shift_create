# app.py
import os
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

from dotenv import load_dotenv

# .envファイルの環境変数をロード
load_dotenv()

# 環境変数からそれぞれの要素を取得
username = os.getenv("DB_USERNAME")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
dbname = os.getenv("DB_DATABASE")

# それらを結合して DATABASE_URL を作成
# database_url = f"postgresql://{username}:{password}@{host}:{port}/{dbname}"
database_url = os.getenv("DATABASE_URL")
app = Flask(__name__)

# HerokuのPostgreSQLデータベースURLを設定（環境変数を使用して安全に取得可能）
app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# Userモデルを定義
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)


# Employeeモデルを定義
class Employee(db.Model):
    __tablename__ = "employees"
    employee_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    full_name = db.Column(db.String(50), nullable=False)
    max_consecutive_days = db.Column(db.Integer, nullable=False)
    max_days_per_week = db.Column(db.Integer, nullable=False)


# ルートURLでユーザーデータを表示
@app.route("/")
def index():
    users = User.query.all()
    employees = Employee.query.all()  # employeesテーブルからデータを取得
    return render_template("index.html", users=users, employees=employees)


if __name__ == "__main__":
    app.run(debug=True)
