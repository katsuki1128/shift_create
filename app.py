# app.py
from flask import Flask, render_template, redirect, url_for, session
from models import db, User, Employee
from config import Config
from auth import auth

app = Flask(__name__)

# アプリの設定をConfigクラスから読み込む
app.config.from_object(Config)

# データベースの初期化（models.pyからインポートしたdbを使用）
db.init_app(app)

# auth.pyで定義したBlueprintを登録
app.register_blueprint(auth)


# ルートURLでユーザーデータを表示
@app.route("/")
def index():
    if "username" not in session:
        return redirect(
            url_for("auth.login")
        )  # セッションにユーザーがいない場合ログイン画面にリダイレクト

    users = User.query.all()
    employees = Employee.query.all()
    return render_template("index.html", users=users, employees=employees)


if __name__ == "__main__":
    app.run(debug=True)
