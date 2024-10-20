# app.py
from flask import Flask
from models import db
from config import Config
from auth import auth
from employee_routes import employee_bp

app = Flask(__name__)

# アプリの設定をConfigクラスから読み込む
app.config.from_object(Config)

# データベースの初期化（models.pyからインポートしたdbを使用）
db.init_app(app)

# authとemployee関連のBlueprintを登録
app.register_blueprint(auth)
app.register_blueprint(employee_bp)

if __name__ == "__main__":
    app.run(debug=True)
