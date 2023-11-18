import os
from flask import Flask, render_template, session, redirect,url_for, flash, current_app, request,jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, LoginManager, login_required, login_user, logout_user, current_user
import time
from sqlalchemy import exc
import click

'''
Config
'''
basedir = os.path.abspath(os.path.dirname(__file__))

# app
app = Flask(__name__)

# database
HOST = '127.0.0.1'
PORT = '3306'
DATABASE = 'database_project'
USERNAME = 'root'
PASSWORD = 'mysql'
DB_URI = 'mysql+pymysql://{}:{}@{}:{}/{}'.format(USERNAME, PASSWORD, HOST, PORT, DATABASE)
DB_CHARSET = "utf8" # 数据库连接编码

app.config['SQLALCHEMY_DATABASE_URI'] = DB_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False #每次请求结束都会自动提交数据库的变动
app.config['SQLALCHEMY_ECHO'] = True

db = SQLAlchemy(app)

# login manager
login_manager = LoginManager(app)

login_manager.session_protection = 'strong'
login_manager.login_view = 'login'
login_manager.login_message = u"你需要登录才能访问这个页面."

'''
Models
'''
# 用户表 (Users)
class User(db.Model):
    __tablename__ = 'users'

    UserID = db.Column(db.Integer, primary_key=True)
    UserName = db.Column(db.String(64), nullable=False, unique=True)
    Password = db.Column(db.String(128), nullable=False)
    Email = db.Column(db.String(128), nullable=False, unique=True)
    UserType = db.Column(db.String(64))
# 商品表 (Products)
class Product(db.Model):
    __tablename__ = 'products'

    ProductID = db.Column(db.Integer, primary_key=True)
    ProductName = db.Column(db.String(128), nullable=False)
    ProductCategory = db.Column(db.String(64))
    Description = db.Column(db.String(256))
    Price = db.Column(db.Float)
    SellerID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    ProductState = db.Column(db.String(64))
    ReleaseDate = db.Column(db.DateTime)
# 订单表 (Orders)
class Order(db.Model):
    __tablename__ = 'orders'

    OrderID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'))
    Trading = db.Column(db.String(64))
    OrderDate = db.Column(db.DateTime)
    OrderStatus = db.Column(db.String(64))
    OrderScore = db.Column(db.Integer)
# 购物车表 (ShoppingCart)
class ShoppingCart(db.Model):
    __tablename__ = 'shoppingcart'

    CartID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'))
    Quantity = db.Column(db.Integer)
# 收藏表 (Favorites)
class Favorite(db.Model):
    __tablename__ = 'favorites'

    FavoriteID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'))
# 评论表 (Comments)
class Comment(db.Model):
    __tablename__ = 'comments'

    CommentID = db.Column(db.Integer, primary_key=True)
    AuthorUserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    TargetUserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    CommentText = db.Column(db.Text)
    CommentDate = db.Column(db.DateTime)
# 回复评论表 (Replies)
class Reply(db.Model):
    __tablename__ = 'replies'

    ReplyID = db.Column(db.Integer, primary_key=True)
    CommentID = db.Column(db.Integer, db.ForeignKey('comments.CommentID'))
    AuthorUserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    ReplyText = db.Column(db.Text)
    ReplyDate = db.Column(db.DateTime)
# 历史记录关系表 (History)
class History(db.Model):
    __tablename__ = 'history'

    HistoryID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'))
    OperationType = db.Column(db.String(64))
    RecordDate = db.Column(db.DateTime)
# 商家好评榜表（TopRating)
class TopRating(db.Model):
    __tablename__ = 'toprating'

    RatingID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    AverageRating = db.Column(db.Float)
    TotalRatings = db.Column(db.Integer)
# 商品平台价格表 (PlatformPrices)
class PlatformPrice(db.Model):
    __tablename__ = 'platformprices'

    PriceID = db.Column(db.Integer, primary_key=True)
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'))
    ProductName = db.Column(db.String(128))
    PlatformName = db.Column(db.String(64))
    Price = db.Column(db.Float)
    ProductLink = db.Column(db.String(256))
    PriceDate = db.Column(db.DateTime)

'''
Forms
'''

'''
View
'''
@app.route('/', methods=['GET', 'POST'])
def index():

    return 'Hello, World!';

# 配置 try:
#         # 从请求中获取前端发送的数据
#         data = request.json
#         username = data.get('username')
#         password = data.get('password')
#
#         # 在这里进行身份验证逻辑，例如检查用户名和密码是否正确
#
#         # 假设验证成功，返回一个示例响应
#         response_data = {'message': 'Login successful', 'username': username}
#         return jsonify(response_data), 200
#     except Exception as e:
#         # 处理异常，例如验证失败或其他错误
#         error_message = {'error': str(e)}
#         return jsonify(error_message), 401  # 401表示未经授权

# 加载用户的回调函数
@login_manager.user_loader
def load_user(user_id):

    return User.query.get(int(user_id))

@app.cli.command()
def init():
    try:
        # 尝试连接数据库
        with app.app_context():
            db.create_all()
        print("Database connected successfully.")
    except exc.SQLAlchemyError as e:
        print(f"Error connecting to the database: {str(e)}")

if __name__=='__main__':

    app.run(debug=True)