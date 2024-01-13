import os
from flask import Flask, render_template, session, redirect, url_for, flash, current_app, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, LoginManager, login_required, login_user, logout_user, current_user
import time
from sqlalchemy import exc
import click
from datetime import datetime
from flask_cors import CORS
from flask_jwt_extended import create_access_token
from flask_jwt_extended import JWTManager
from sqlalchemy import func
from flask import send_from_directory
import base64
import jd
import psycopg2
from sqlalchemy import exc, desc
from apscheduler.schedulers.background import BackgroundScheduler

'''
Config
'''
basedir = os.path.abspath(os.path.dirname(__file__))

# app
app = Flask(__name__)
jwt = JWTManager(app)
# CROS
CORS(app)
# database
# HOST = '127.0.0.1'
# PORT = '3306'
# DATABASE = 'database_project'
# USERNAME = 'root'
# # PASSWORD = 'mysql'
# PASSWORD = '990516lyT?*k'


HOST = '120.46.80.149'
PORT = '3306'
# DATABASE = 'db21373372'
# USERNAME = '21373372'
# PASSWORD = 'Aa749924'

DATABASE = 'db21371245'
USERNAME = '21371245'
PASSWORD = 'Aa825915'
DB_URI = 'mysql+pymysql://{}:{}@{}:{}/{}'.format(USERNAME, PASSWORD, HOST, PORT, DATABASE)
DB_CHARSET = "utf8"  # 数据库连接编码

app.config['SQLALCHEMY_DATABASE_URI'] = DB_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # 每次请求结束都会自动提交数据库的变动
app.config['SQLALCHEMY_ECHO'] = True

db = SQLAlchemy(app)

# login manager
login_manager = LoginManager(app)

login_manager.session_protection = 'strong'
login_manager.login_view = 'login'  # 登录重定向
login_manager.login_message = u"你需要登录才能访问这个页面."
app.config['SECRET_KEY'] = "this is a secret_key"

# 调度器
scheduler = BackgroundScheduler(daemon=True)

'''
Data
'''


def allocUserId(globalUserID):
    userId = globalUserID + 1
    # globalUserID+=1
    return userId


'''
Models
'''


# 用户表 (Users)
class User(UserMixin, db.Model):
    __tablename__ = 'users'

    UserID = db.Column(db.Integer, primary_key=True)
    UserName = db.Column(db.String(64), nullable=False, unique=True, index=True)
    Password = db.Column(db.String(128), nullable=False)
    Email = db.Column(db.String(128), nullable=False, unique=True)
    UserType = db.Column(db.String(10), nullable=False)
    UserDescription = db.Column(db.String(256))
    UserAvatar = db.Column(db.String(256))

    __table_args__ = (
        db.CheckConstraint(UserType.in_(['admin', 'normal']), name='check_user_type'),
    )

    def verify_password(self, password):
        return self.Password == password

    def get_id(self):
        return str(self.UserID)

    def printUser(self):
        user_data = {
            'UserID': self.UserID,
            'UserName': self.UserName,
            'Email': self.Email,
            'UserType': self.UserType,
            'UserDescription': self.UserDescription,
            'UserAvatar': self.UserAvatar
            # 可以根据需要添加其他字段
        }
        return user_data


# 商品表 (Products)
class Product(db.Model):
    __tablename__ = 'products'

    ProductID = db.Column(db.Integer, primary_key=True)
    ProductName = db.Column(db.String(128), nullable=False)
    ProductCategory = db.Column(db.String(64))
    Description = db.Column(db.String(256))
    Price = db.Column(db.Float)
    SellerID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    # SellerId是UserID的外键
    ProductState = db.Column(db.String(10), nullable=False, default='available')
    ReleaseDate = db.Column(db.DateTime)

    __table_args__ = (
        db.CheckConstraint(ProductState.in_(['available', 'sold']), name='check_product_state'),
    )

    def printProduct(self):
        product_data = {
            'ProductID': self.ProductID,
            'ProductName': self.ProductName,
            'ProductCategory': self.ProductCategory,
            'Description': self.Description,
            'Price': self.Price,
            'SellerID': self.SellerID,
            'ProductState': self.ProductState,
            'ReleaseDate': self.ReleaseDate.strftime('%Y-%m-%d %H:%M:%S') if self.ReleaseDate else None
            # 可以根据需要添加其他字段
        }
        return product_data


# 订单表 (Orders)
class Order(db.Model):
    __tablename__ = 'orders'

    OrderID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'), index=True)
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'), index=True)
    # Trading = db.Column(db.String(64))
    OrderDate = db.Column(db.DateTime)
    OrderStatus = db.Column(db.String(64), default='reserve')
    OrderScore = db.Column(db.Integer, default=-1)

    __table_args__ = (
        db.CheckConstraint(OrderStatus.in_(['reserve', 'finish']), name='checkOrderStatus'),
    )

    def printOrder(self):
        order_data = {
            'OrderID': self.OrderID,
            'UserID': self.UserID,
            'ProductID': self.ProductID,
            # 'Trading': self.Trading,
            'OrderDate': self.OrderDate.strftime('%Y-%m-%d %H:%M:%S') if self.OrderDate else None,
            'OrderStatus': self.OrderStatus,
            'OrderScore': self.OrderScore
        }
        return order_data


# 购物车表 (ShoppingCart)
class ShoppingCart(db.Model):
    __tablename__ = 'shoppingcart'

    CartID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'), index=True)
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'), index=True)
    Quantity = db.Column(db.Integer, default=1)

    def printShoppingCart(self):
        cart_data = {
            'CartID': self.CartID,
            'UserID': self.UserID,
            'ProductID': self.ProductID,
            'Quantity': self.Quantity
        }
        return cart_data


# 收藏表 (Favorites)
class Favorite(db.Model):
    __tablename__ = 'favorites'

    FavoriteID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'), index=True)
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'), index=True)

    def printFavorite(self):
        favorite_data = {
            'FavoriteID': self.FavoriteID,
            'UserID': self.UserID,
            'ProductID': self.ProductID
        }
        return favorite_data


# 评论表 (Comments)
class Comment(db.Model):
    __tablename__ = 'comments'

    CommentID = db.Column(db.Integer, primary_key=True)
    AuthorUserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    TargetUserID = db.Column(db.Integer, db.ForeignKey('users.UserID'), index=True)
    CommentText = db.Column(db.Text)
    CommentDate = db.Column(db.DateTime)

    def printComment(self):
        comment_data = {
            'CommentID': self.CommentID,
            'AuthorUserID': self.AuthorUserID,
            'TargetUserID': self.TargetUserID,
            'CommentText': self.CommentText,
            'CommentDate': self.CommentDate.strftime('%Y-%m-%d %H:%M:%S') if self.CommentDate else None
        }
        return comment_data


# 回复评论表 (Replies)
class Reply(db.Model):
    __tablename__ = 'replies'

    ReplyID = db.Column(db.Integer, primary_key=True)
    CommentID = db.Column(db.Integer, db.ForeignKey('comments.CommentID'), index=True)
    AuthorUserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    ReplyText = db.Column(db.Text)
    ReplyDate = db.Column(db.DateTime)

    def printReply(self):
        reply_data = {
            'ReplyID': self.ReplyID,
            'CommentID': self.CommentID,
            'AuthorUserID': self.AuthorUserID,
            'ReplyText': self.ReplyText,
            'ReplyDate': self.ReplyDate.strftime('%Y-%m-%d %H:%M:%S') if self.ReplyDate else None
        }
        return reply_data


# 历史记录关系表 (History)
class History(db.Model):
    __tablename__ = 'history'

    HistoryID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'), index=True)
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'), index=True)
    OperationType = db.Column(db.String(64), default='browse')
    RecordDate = db.Column(db.DateTime)

    __table_args__ = (
        db.CheckConstraint(OperationType.in_(['browse']), name='checkOperationType'),
    )

    def printHistory(self):
        history_data = {
            'HistoryID': self.HistoryID,
            'UserID': self.UserID,
            'ProductID': self.ProductID,
            'OperationType': self.OperationType,
            'RecordDate': self.RecordDate.strftime('%Y-%m-%d %H:%M:%S') if self.RecordDate else None
        }
        return history_data


# 商家好评榜表（TopRating)
class TopRating(db.Model):
    __tablename__ = 'toprating'

    RatingID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'), index=True)
    AverageRating = db.Column(db.Float)

    def printTopRating(self):
        top_rating_data = {
            'RatingID': self.RatingID,
            'UserID': self.UserID,
            'AverageRating': self.AverageRating,
        }
        return top_rating_data


# 商品平台价格表 (PlatformPrices)
class PlatformPrice(db.Model):
    __tablename__ = 'platformprices'

    PriceID = db.Column(db.Integer, primary_key=True)
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'), index=True)
    ProductName = db.Column(db.String(128))
    PlatformName = db.Column(db.String(64), default='jd')
    Price = db.Column(db.Float)
    ProductLink = db.Column(db.String(256))
    PriceDate = db.Column(db.DateTime)

    __table_args__ = (
        db.CheckConstraint(PlatformName.in_(['jd']), name='checkPlatformName'),
    )

    def printPlatformPrice(self):
        platform_price_data = {
            'PriceID': self.PriceID,
            'ProductID': self.ProductID,
            'ProductName': self.ProductName,
            'PlatformName': self.PlatformName,
            'Price': self.Price,
            'ProductLink': self.ProductLink,
            'PriceDate': self.PriceDate.strftime('%Y-%m-%d %H:%M:%S') if self.PriceDate else None
        }
        return platform_price_data


'''
Allocate
'''


class IDGenerator:
    def __init__(self, initial_id=0):
        self.current_id = initial_id

    def allocate_id(self):
        self.current_id += 1
        return self.current_id


# 创建 IDGenerator 实例
with app.app_context():
    userid_generator = IDGenerator(
        User.query.order_by(User.UserID.desc()).first().UserID if User.query.count() > 0 else 0)
    productid_generator = IDGenerator(
        Product.query.order_by(Product.ProductID.desc()).first().ProductID if Product.query.count() > 0 else 0)
    orderid_generator = IDGenerator(
        Order.query.order_by(Order.OrderID.desc()).first().OrderID if Order.query.count() > 0 else 0)
    cartid_generator = IDGenerator(
        ShoppingCart.query.order_by(ShoppingCart.CartID.desc()).first().CartID if ShoppingCart.query.count() > 0 else 0)
    favouriteid_generator = IDGenerator(
        Favorite.query.order_by(Favorite.FavoriteID.desc()).first().FavoriteID if Favorite.query.count() > 0 else 0)
    commentid_generator = IDGenerator(
        Comment.query.order_by(Comment.CommentID.desc()).first().CommentID if Comment.query.count() > 0 else 0)
    replyid_generator = IDGenerator(
        Reply.query.order_by(Reply.ReplyID.desc()).first().ReplyID if Reply.query.count() > 0 else 0)
    historyid_generator = IDGenerator(
        History.query.order_by(History.HistoryID.desc()).first().HistoryID if History.query.count() > 0 else 0)
    ratingid_generator = IDGenerator(
        TopRating.query.order_by(TopRating.RatingID.desc()).first().RatingID if TopRating.query.count() > 0 else 0)
    priceid_generator = IDGenerator(PlatformPrice.query.order_by(
        PlatformPrice.PriceID.desc()).first().PriceID if PlatformPrice.query.count() > 0 else 0)

# with app.app_context():
#     userid_generator = IDGenerator(0)
#     productid_generator = IDGenerator( 0)
#     orderid_generator = IDGenerator( 0)
#     cartid_generator = IDGenerator( 0)
#     favouriteid_generator = IDGenerator(0)
#     commentid_generator = IDGenerator( 0)
#     replyid_generator = IDGenerator(0)
#     historyid_generator = IDGenerator(0)
#     ratingid_generator = IDGenerator(0)
#     priceid_generator = IDGenerator(0)

'''
Forms
'''

'''
View
'''


@app.route('/', methods=['GET', 'POST'])
def index():
    return 'Hello, World!'


@app.route('/images/users/<username>')
def get_image(username):
    user = User.query.filter_by(UserName=username).first()

    avatar = "default.jpg"
    if user:
        avatar = user.UserAvatar

    return send_from_directory('./images/users/', avatar)


@app.route('/images/users/<int:userid>')
def get_user_image(userid):
    user = User.query.filter_by(UserID=userid).first()

    avatar = "default.jpg"
    if user:
        avatar = user.UserAvatar

    return send_from_directory('./images/users/', avatar)


@app.route('/images/products/<int:productid>', methods=['GET'])
def get_product_image(productid):
    product = Product.query.filter_by(ProductID=productid).first()
    folder_path = f'./images/products/{productid}/'

    # 遍历文件夹中的所有文件
    image_list = []
    for filename in os.listdir(folder_path):
        if filename.endswith('.jpg') or filename.endswith('.png'):
            file_path = os.path.join(folder_path, filename)

            # 将图片文件转换为Base64编码
            with open(file_path, 'rb') as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
                image_list.append(base64_image)

    print("image_list: ", image_list)

    # 返回Base64编码的图片列表给前端
    return jsonify({'images': image_list})


@app.route('/products/<int:productid>', methods=['GET'])
def get_product_detail(productid):
    product = Product.query.filter_by(ProductID=productid).first()

    results = []
    for product in products:
        result = {
            'ProductID': product.ProductID,
            'ProductName': product.ProductName,
            'ProductCategory': product.ProductCategory,
            'Description': product.Description,
            'Price': product.Price,
            'SellerID': product.SellerID,
            'ProductState': product.ProductState,
            'ReleaseDate': product.ReleaseDate.strftime('%Y-%m-%d %H:%M:%S')
        }
        results.append(result)

    # 返回Base64编码的图片列表给前端
    return jsonify(results), 200


@app.route('/auth/register', methods=['GET', 'POST'])
def register():
    data = request.get_json()

    username = data['username']
    password = data['password']
    email = data['email']

    print("ok")

    user = User.query.filter_by(UserName=username).first()
    globalUserID = db.session.query(func.max(User.UserID)).scalar()
    userId = userid_generator.allocate_id()
    if user is None:
        new_user = User(
            UserID=userId,
            UserName=username,
            Password=password,
            Email=email,
            UserType="normal",
            UserDescription="用几句话介绍一下自己吧",
            UserAvatar="default.jpg"
        )
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        access_token = create_access_token(identity=username)
        return jsonify(token=access_token, username=username, userId=userId), 200
    else:
        error_message = {'message': 'Invalid Username or Password'}
        return jsonify(error_message), 401


@app.route('/auth/login', methods=['GET', 'POST'])
def login():
    data = request.get_json()

    username = data['username']
    password = data['password']
    print("username: ", username)
    print("password: ", password)

    user = User.query.filter_by(UserName=username).first()
    if user is not None and user.verify_password(password):
        # 如果用户名和密码验证成功，生成访问令牌
        print("ok")
        access_token = create_access_token(identity=username)
        login_user(user)
        userId = user.get_id()
        return jsonify(token=access_token, username=username, userId=userId), 200
    else:
        error_message = {'message': '无效的用户名或密码'}
        return jsonify(error_message), 401


@app.route('/users/<user_name>', methods=['GET'])
def get_user(user_name):
    user = User.query.filter(User.UserName == user_name).first()
    if user is None:
        return jsonify({'message': 'User not found'}), 404
    response_data = {
        'UserID': user.UserID,
        'UserName': user.UserName,
        'Password': user.Password,
        'Email': user.Email,
        'UserDescription': user.UserDescription,
        'UserAvatar': user.UserAvatar,
        'UserType': user.UserType
    }
    return jsonify(response_data), 200


# TODO: 注意外键关系，需要先删除外键关系，再删除账号
@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.filter_by(UserID=user_id).first()
    # user = User.query.filter_by(UserName=user_name).first()
    if user:
        orders = Order.query.filter_by(UserID=user.UserID)
        for order in orders:
            db.session.delete(order)
            db.session.commit()
        shoppingCarts = ShoppingCart.query.filter_by(UserID=user.UserID)
        for shoppingCart in shoppingCarts:
            db.session.delete(shoppingCart)
            db.session.commit()
        favourites = Favorite.query.filter_by(UserID=user.UserID)
        for favourite in favourites:
            db.session.delete(favourite)
            db.session.commit()
        replies = Reply.query.filter_by(AuthorUserID=user.UserID)
        for reply in replies:
            db.session.delete(reply)
            db.session.commit()
        comments = Comment.query.filter_by(TargetUserID=user.UserID)
        for comment in comments:
            replies = Reply.query.filter_by(CommentID=comment.CommentID)
            for reply in replies:
                db.session.delete(reply)
                db.session.commit()
            db.session.delete(comment)
            db.session.commit()
        comments = Comment.query.filter_by(AuthorUserID=user.UserID)
        for comment in comments:
            replies = Reply.query.filter_by(CommentID=comment.CommentID)
            for reply in replies:
                db.session.delete(reply)
                db.session.commit()
            db.session.delete(comment)
            db.session.commit()
        histories = History.query.filter_by(UserID=user.UserID)
        for history in histories:
            db.session.delete(history)
            db.session.commit()
        topRatings = TopRating.query.filter_by(UserID=user.UserID)
        for topRating in topRatings:
            db.session.delete(topRating)
            db.session.commit()
        products = Product.query.filter_by(SellerID=user.UserID)
        for product in products:
            prices = PlatformPrice.query.filter_by(ProductID=product.ProductID)
            for price in prices:
                db.session.delete(price)
                db.session.commit()
            histories = History.query.filter_by(ProductID=product.ProductID)
            for history in histories:
                db.session.delete(history)
                db.session.commit()
            favourites = Favorite.query.filter_by(ProductID=product.ProductID)
            for favourite in favourites:
                db.session.delete(favourite)
                db.session.commit()
            shoppingCarts = ShoppingCart.query.filter_by(ProductID=product.ProductID)
            for shoppingCart in shoppingCarts:
                db.session.delete(shoppingCart)
                db.session.commit()
            orders = Order.query.filter_by(ProductID=product.ProductID)
            for order in orders:
                db.session.delete(order)
                db.session.commit()
            db.session.delete(product)
            db.session.commit()
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    else:
        return jsonify({'message': 'User not found'}), 404


# if user:
#             result = {
#                 'UserID': user.UserID,
#                 'UserName': user.UserName,
#                 'Password': user.Password,
#                 'Email': user.Email,
#                 'UserType': user.UserType,
#             }
#             return jsonify(result), 200
#         else:
#             return jsonify({'message': 'User not found'}), 404

@app.route('/products', methods=['GET', 'POST'])
def products():
    # products = Product.query.all()
    # 显示不在订单表中的商品
    subquery = db.session.query(Order.ProductID).subquery()
    products = Product.query.filter(~Product.ProductID.in_(subquery)).all()

    results = []
    for product in products:
        result = {
            'ProductID': product.ProductID,
            'ProductName': product.ProductName,
            'ProductCategory': product.ProductCategory,
            'Description': product.Description,
            'Price': product.Price,
            'SellerID': product.SellerID,
            'ProductState': product.ProductState,
            'ReleaseDate': product.ReleaseDate.strftime('%Y-%m-%d %H:%M:%S')
        }
        results.append(result)
    response_data = {
        'products': results,
        'total': len(results),
        'skip': 0,  # 你可能需要根据分页逻辑进行调整
        'limit': 30  # 你可能需要根据分页逻辑进行调整
    }

    return jsonify(response_data), 200


# 新增product
@app.route('/product/add', methods=['GET', 'POST'])
def add_product():
    print("add_product")
    ProductName = request.form.get('ProductName')
    ProductCategory = request.form.get('ProductCategory')
    Description = request.form.get('Description')
    Price = request.form.get('Price')
    SellerID = request.form.get('SellerID')
    # productState不用，默认available
    globalProductID = db.session.query(func.max(Product.ProductID)).scalar()
    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName=ProductName,
        ProductCategory=ProductCategory,
        Description=Description,
        Price=Price,
        SellerID=SellerID,  # 请根据实际情况设置卖家ID
        ReleaseDate=datetime.now()
    )

    print(f"{new_product.ProductID}")
    if 'file0' not in request.files:
        return jsonify({'message': '没有上传图片'}), 400

    files = request.files.values()

    # 确保目录存在，如果不存在就创建
    os.makedirs(f'./images/products/{new_product.ProductID}', exist_ok=True)

    for image in files:
        # 保存文件到指定目录
        image.save(f'./images/products/{new_product.ProductID}/' + image.filename)

    db.session.add(new_product)
    db.session.commit()
    search_product_price(new_product.ProductID)

    return jsonify({'message': 'Product added successfully'}), 200


# 修改个人信息
@app.route('/users/update/<int:user_id>', methods=['POST'])
def update_profile(user_id):
    print("update_user")
    username = request.form.get('username')
    email = request.form.get('email')
    description = request.form.get('description')

    user = User.query.filter_by(UserID=user_id).first()

    if user is None:
        return jsonify({'message': 'User not found'}), 404

    if (username != None and username != ""):
        user.UserName = username
    if (email != None and email != ""):
        user.Email = email
    if (description != None and description != ""):
        user.UserDescription = description

    # print(f"{new_product.ProductID}")
    if 'avatar' in request.files:
        avatar = request.files['avatar']

        if avatar.filename != '':
            original_filename, file_extension = os.path.splitext(avatar.filename)
            newAvatarName = f'{user_id}{file_extension}'
            avatar.save(f'./images/users/' + newAvatarName)
            user.UserAvatar = newAvatarName

    db.session.commit()

    return jsonify({'message': 'User profile updated successfully'}), 200


# 修改密码
@app.route('/password/update/<int:user_id>', methods=['POST'])
def update_passord(user_id):
    print("update_password")
    password = request.json.get('password')
    # email = request.form.get('email')
    # description = request.form.get('description')

    user = User.query.filter_by(UserID=user_id).first()

    if user is None:
        return jsonify({'message': '没有该用户'}), 404

    user.Password = password

    # print(f"{new_product.ProductID}")

    db.session.commit()

    return jsonify({'message': 'User password updated successfully'}), 200


@app.route('/product/<int:product_id>')
def get_product(product_id):
    product = Product.query.filter(Product.ProductID == product_id).first()

    response_data = {
        'ProductID': product.ProductID,
        'ProductName': product.ProductName,
        'ProductCategory': product.ProductCategory,
        'Description': product.Description,
        'Price': product.Price,
        'SellerID': product.SellerID,
        'ProductState': product.ProductState,
        'ReleaseDate': product.ReleaseDate.strftime('%Y-%m-%d %H:%M:%S')
    }
    return jsonify(response_data), 200


# 删除商品
@app.route('/product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.filter_by(ProductID=product_id).first()
    prices = PlatformPrice.query.filter_by(ProductID=product.ProductID).all()
    for price in prices:
        db.session.delete(price)
        db.session.commit()
    histories = History.query.filter_by(ProductID=product.ProductID).all()
    for history in histories:
        db.session.delete(history)
        db.session.commit()
    favourites = Favorite.query.filter_by(ProductID=product.ProductID).all()
    for favourite in favourites:
        db.session.delete(favourite)
        db.session.commit()
    shoppingCarts = ShoppingCart.query.filter_by(ProductID=product.ProductID).all()
    for shoppingCart in shoppingCarts:
        db.session.delete(shoppingCart)
        db.session.commit()
    orders = Order.query.filter_by(ProductID=product.ProductID).all()
    for order in orders:
        db.session.delete(order)
        db.session.commit()
    db.session.delete(product)
    db.session.commit()
    # 删除图片
    folder_path = f'./images/products/{product_id}/'
    # 清空文件夹中的所有文件
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
            return jsonify({'message': 'Product deleted failed'}), 500

    return jsonify({'message': 'Product deleted successfully'}), 200


@app.route('/users/<int:user_id>', methods=['GET'])
def get_user_byId(user_id):
    user = User.query.filter(User.UserID == user_id).first()

    response_data = {
        'UserID': user.UserID,
        'UserName': user.UserName,
        'Password': user.Password,
        'Email': user.Email,
        'UserDescription': user.UserDescription,
        'UserAvatar': user.UserAvatar,
        'UserType': user.UserType
    }
    return jsonify(response_data), 200


@app.route('/products/search', methods=['GET', 'POST'])
def products_search():
    try:
        # 获取查询参数 q
        query = request.args.get('q')
        products = Product.query.filter(Product.ProductName.ilike(f"%{query}%")).all()

        results = []
        for product in products:
            result = {
                'ProductID': product.ProductID,
                'ProductName': product.ProductName,
                'ProductCategory': product.ProductCategory,
                'Description': product.Description,
                'Price': product.Price,
                'SellerID': product.SellerID,
                'ProductState': product.ProductState,
                'ReleaseDate': product.ReleaseDate.strftime('%Y-%m-%d %H:%M:%S')
            }
            results.append(result)
        response_data = {
            'products': results,
            'total': len(results),
            'skip': 0,  # 你可能需要根据分页逻辑进行调整
            'limit': 30  # 你可能需要根据分页逻辑进行调整
        }

        return jsonify(response_data), 200
    except Exception as e:
        # 处理异常，返回适当的错误响应
        error_message = {'error': str(e)}
        return jsonify(error_message), 500


@app.route('/orders/<int:user_id>', methods=['GET'])
def get_orders(user_id):
    try:
        orders = Order.query.filter_by(UserID=user_id).all()

        results = []
        for order in orders:
            result = {
                'OrderID': order.OrderID,
                'UserID': order.UserID,
                'ProductID': order.ProductID,
                # 'Trading': order.Trading,
                'OrderDate': order.OrderDate.strftime('%Y-%m-%d %H:%M:%S') if order.OrderDate else None,
                'OrderStatus': order.OrderStatus,
                'OrderScore': order.OrderScore
            }
            results.append(result)
        response_data = {
            'orders': results,
            'total': len(results),
            'skip': 0,  # 你可能需要根据分页逻辑进行调整
            'limit': 30  # 你可能需要根据分页逻辑进行调整
        }

        return jsonify(response_data), 200
    except Exception as e:
        # 处理异常，返回适当的错误响应
        error_message = {'error': str(e)}
        return jsonify(error_message), 500


# 修改订单
@app.route('/orders/confirm/<int:order_id>', methods=['POST'])
def finishOrder(order_id):
    order = Order.query.filter_by(OrderID=order_id).first()
    order.OrderStatus = 'finish'
    db.session.commit()

    return jsonify({'message': 'Order finished successfully'}), 200


# 订单评分
@app.route('/orders/scores/<int:order_id>', methods=['POST'])
def scoreOrder(order_id):
    score = request.form.get("Score")
    print(score)

    order = Order.query.filter_by(OrderID=order_id).first()
    if order is None:
        return jsonify({'message': 'Order scoreed failed'}), 500
    order.OrderScore = int(score)
    db.session.commit()

    return jsonify({'message': 'Order scoreed successfully'}), 200


# 获取商家在销商品
@app.route('/selling_orders/<int:user_id>', methods=['GET'])
def get_selling_orders(user_id):
    products = Product.query.filter_by(SellerID=user_id).all()
    results = []
    for item in products:
        order = Order.query.filter_by(ProductID=item.ProductID).first()
        if order:
            result = order.printOrder()
            results.append(result)

    response_data = {
        'selling_orders_items': results,
        'total': len(results),
        'skip': 0,  # 你可能需要根据分页逻辑进行调整
        'limit': 30  # 你可能需要根据分页逻辑进行调整
    }

    return jsonify(response_data), 200


# 通过订单获取卖家详细信息
@app.route('/orders/seller/<int:order_id>', methods=['GET'])
def get_seller_of_order(order_id):
    order = Order.query.filter_by(OrderID=order_id).first()
    product = Product.query.filter_by(ProductID=order.ProductID).first()

    user = User.query.filter_by(UserID=product.SellerID).first()
    response_data = {
        'UserID': user.UserID,
        'UserName': user.UserName,
        'Password': user.Password,
        'Email': user.Email,
        'UserDescription': user.UserDescription,
        'UserAvatar': user.UserAvatar,
        'UserType': user.UserType
    }
    return jsonify(response_data), 200


# 获取购物车
@app.route('/shoppingcart/<int:user_id>', methods=['GET'])
def get_shoppingcart(user_id):
    try:
        shopping_cart_items = ShoppingCart.query.filter_by(UserID=user_id).all()

        results = []
        for item in shopping_cart_items:
            result = {
                'CartID': item.CartID,
                'UserID': item.UserID,
                'ProductID': item.ProductID,
                'Quantity': item.Quantity
            }
            results.append(result)

        response_data = {
            'shopping_cart_items': results,
            'total': len(results),
            'skip': 0,  # 你可能需要根据分页逻辑进行调整
            'limit': 30  # 你可能需要根据分页逻辑进行调整
        }

        return jsonify(response_data), 200
    except Exception as e:
        # 处理异常，返回适当的错误响应
        error_message = {'error': str(e)}
        return jsonify(error_message), 500


# 添加购物车
@app.route('/shoppingcart/<int:user_id>/<int:product_id>', methods=['POST'])
def add_shoppingcart(user_id, product_id):
    # UserID=request.form.get("UserID")
    # ProductID=request.form.get("ProductID")
    # Quantity=request.form.get("Quantity")
    UserID = int(user_id)
    ProductID = int(product_id)
    Quantity = 1
    new_shopping_cart = ShoppingCart(
        CartID=cartid_generator.allocate_id(),
        # UserID=user_id,
        UserID=UserID,
        ProductID=ProductID,
        Quantity=Quantity
    )

    db.session.add(new_shopping_cart)
    db.session.commit()
    return jsonify({'message': 'Cart added successfully'}), 200


# 删除购物车
@app.route('/shoppingcart/<int:user_id>/<int:product_id>', methods=['DELETE'])
def delete_shoppingcart(user_id, product_id):
    shoppingcart = ShoppingCart.query.filter_by(UserID=user_id, ProductID=product_id).first()
    if shoppingcart:
        db.session.delete(shoppingcart)
        db.session.commit()  # 注意这里的正确调用方式
        return jsonify({'message': 'Shoppingcart deleted successfully'}), 200
    else:
        return jsonify({'message': 'Shoppingcart not found'}), 404


# 获取收藏
@app.route('/favorite/<int:user_id>', methods=['GET'])
def get_favorite(user_id):
    try:
        favorite_items = Favorite.query.filter_by(UserID=user_id).all()

        results = []
        for item in favorite_items:
            result = {
                'FavoriteID ': item.FavoriteID,
                'UserID': item.UserID,
                'ProductID': item.ProductID
            }
            results.append(result)

        response_data = {
            'favorite_items': results,
            'total': len(results),
            'skip': 0,  # 你可能需要根据分页逻辑进行调整
            'limit': 30  # 你可能需要根据分页逻辑进行调整
        }

        return jsonify(response_data), 200
    except Exception as e:
        # 处理异常，返回适当的错误响应
        error_message = {'error': str(e)}
        return jsonify(error_message), 500


# 添加收藏
@app.route('/favorite/<int:user_id>/<int:product_id>', methods=['POST'])
def add_favorite(user_id, product_id):
    UserID = int(user_id)
    ProductID = int(product_id)
    new_favorite = Favorite(
        FavoriteID=favouriteid_generator.allocate_id(),
        UserID=UserID,
        ProductID=ProductID
    )
    db.session.add(new_favorite)
    db.session.commit()
    return jsonify({'message': 'Favorite added successfully'}), 200


# 删除收藏
@app.route('/favorite/<int:user_id>/<int:product_id>', methods=['DELETE'])
def delete_favorite(user_id, product_id):
    favorite = Favorite.query.filter_by(UserID=user_id, ProductID=product_id).first()
    if favorite:
        db.session.delete(favorite)
        db.session.commit()  # 注意这里的正确调用方式
        return jsonify({'message': 'Favorite deleted successfully'}), 200
    else:
        return jsonify({'message': 'Favorite not found'}), 404


# 获取评论 这里是target是该用户
@app.route('/comments/<int:user_id>', methods=['GET'])
def get_comment(user_id):
    try:
        comments = Comment.query.filter_by(TargetUserID=user_id).all()

        results = []
        for item in comments:
            result = item.printComment()
            results.append(result)

        response_data = {
            'comment_items': results,
            'total': len(results),
            'skip': 0,  # 你可能需要根据分页逻辑进行调整
            'limit': 30  # 你可能需要根据分页逻辑进行调整
        }

        return jsonify(response_data), 200
    except Exception as e:
        # 处理异常，返回适当的错误响应
        error_message = {'error': str(e)}
        return jsonify(error_message), 500


# 添加评论，这里是authorUserId
@app.route('/comment/<int:user_id>', methods=['POST'])
def add_comment(user_id):
    AuthorUserID = request.form.get("AuthorUserID"),
    TargetUserID = request.form.get("TargetUserID"),
    CommentText = request.form.get("CommentText"),
    CommentDate = request.form.get("CommentDate")
    new_comment = Comment(
        CommentID=commentid_generator.allocate_id(),
        AuthorUserID=AuthorUserID,
        TargetUserID=TargetUserID,
        CommentText=CommentText,
        CommentDate=CommentDate
    )
    db.session.add(new_comment)
    db.session.commit()

    return ({"message": "Comment added successfully"}), 200


# 评论删除
@app.route('/comment/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    comment = Comment.query.filter_by(CommentID=comment_id).first()
    if comment is None:
        return jsonify({'message': 'Comment not existed'}), 404

    replies = Reply.query.filter_by(CommentID=comment.CommentID)
    for reply in replies:
        db.session.delete(reply)
        db.session.commit()
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted successfully'}), 200


# 更新评论
@app.route('/comment/<int:comment_id>', methods=['PATCH'])
def update_comment(comment_id):
    comment = Comment.query.filter_by(CommentID=comment_id).first()
    if comment is None:
        return jsonify({'message': 'Comment not existed'}), 404

    # 获取请求体中的数据
    updated_data = request.json.get('CommentText')
    print("updatedData: ", updated_data)
    comment.CommentText = updated_data
    comment.CommentDate = datetime.now()

    # db.session.delete(reply)
    db.session.commit()
    return jsonify({'message': 'Comment updated successfully'}), 200


# 获取二级评论
@app.route('/reply/<int:comment_id>', methods=['GET'])
def get_reply(comment_id):
    try:
        replies = Reply.query.filter_by(CommentID=comment_id).all()

        results = []
        for item in replies:
            result = item.printReply()
            results.append(result)

        response_data = {
            'reply_items': results,
            'total': len(results),
            'skip': 0,  # 你可能需要根据分页逻辑进行调整
            'limit': 30  # 你可能需要根据分页逻辑进行调整
        }

        return jsonify(response_data), 200
    except Exception as e:
        # 处理异常，返回适当的错误响应
        error_message = {'error': str(e)}
        return jsonify(error_message), 500


# 新增二级评论
@app.route('/reply/<int:user_id>', methods=['POST'])
def add_second_comment(user_id):
    CommentID = request.form.get("CommentID")
    AuthorUserID = request.form.get("AuthorUserID")
    ReplyText = request.form.get("ReplyText")
    ReplyDate = request.form.get("ReplyDate")
    new_reply = Reply(
        ReplyID=replyid_generator.allocate_id(),
        CommentID=CommentID,
        AuthorUserID=AuthorUserID,
        ReplyText=ReplyText,
        ReplyDate=ReplyDate
    )
    db.session.add(new_reply)
    db.session.commit()

    return ({"message": "Reply added successfully"}), 200


# 删除二级评论
@app.route('/reply/<int:reply_id>', methods=['DELETE'])
def delete_reply(reply_id):
    reply = Reply.query.filter_by(ReplyID=reply_id).first()
    if reply is None:
        return jsonify({'message': 'Reply not found'}), 404

    db.session.delete(reply)
    db.session.commit()
    return jsonify({'message': 'Reply deleted successfully'}), 200


# 更新二级评论
@app.route('/reply/<int:reply_id>', methods=['PATCH'])
def update_reply(reply_id):
    reply = Reply.query.filter_by(ReplyID=reply_id).first()

    if reply is None:
        return jsonify({'message': 'Reply not found'}), 404

    # 获取请求体中的数据
    updated_data = request.json.get('ReplyText')
    reply.ReplyText = updated_data
    reply.ReplyDate = datetime.now()

    # db.session.delete(reply)
    db.session.commit()
    return jsonify({'message': 'Reply updated successfully'}), 200


# 获取历史记录
@app.route('/history/<user_id>', methods=['GET'])
def get_history(user_id):
    try:
        histories = History.query.filter_by(UserID=user_id).order_by(desc(History.RecordDate)).all()
        results = []
        for item in histories:
            result = item.printHistory()
            results.append(result)

        response_data = {
            'history_items': results,
            'total': len(results),
            'skip': 0,  # 你可能需要根据分页逻辑进行调整
            'limit': 30  # 你可能需要根据分页逻辑进行调整
        }

        return jsonify(response_data), 200
    except Exception as e:
        # 处理异常，返回适当的错误响应
        error_message = {'error': str(e)}
        return jsonify(error_message), 500


# 新增历史记录
@app.route('/history/<user_id>', methods=['POST'])
def add_history(user_id):
    UserID = user_id,
    ProductID = request.form.get("ProductID"),
    OperationType = request.form.get("OperationType"),
    # Start a database transaction
    with db.session.begin_nested():
        history = History.query.filter_by(UserID=UserID, ProductID=ProductID).first()

        if history:
            history.RecordDate = datetime.now()
        else:
            new_history = History(
                HistoryID=historyid_generator.allocate_id(),
                UserID=UserID,
                ProductID=ProductID,
                OperationType=OperationType,
                RecordDate=datetime.now()
            )
            db.session.add(new_history)

    db.session.commit()

    return jsonify({'message': 'History added successfully'}), 200


# 删除历史记录
@app.route('/history/<int:history_id>', methods=['DELETE'])
def delete_history(history_id):
    history = History.query.filter_by(HistoryID=history_id).first()

    db.session.delete(history)
    db.session.commit()
    return jsonify({'message': 'History deleted successfully'}), 200


# 添加order
@app.route('/orders/<int:user_id>', methods=['POST'])
def add_order(user_id):
    print(request.form.get("ProductID"))
    ProductID = int(request.form.get("ProductID"))
    product = Product.query.filter_by(ProductID=ProductID).first()
    seller = User.query.filter_by(UserID=product.SellerID).first()

    # Trading = seller.Email
    new_order = Order(
        OrderID=orderid_generator.allocate_id(),
        UserID=user_id,
        ProductID=ProductID,
        # Trading=Trading,
        OrderDate=datetime.now(),
        OrderStatus="reserve",
        OrderScore=-1
    )

    # 删除对应购物车内容
    shopping_cart_items = ShoppingCart.query.filter_by(ProductID=ProductID).all()
    for shopping_cart in shopping_cart_items:
        db.session.delete(shopping_cart)
    # 删除对应历史记录
    histories = History.query.filter_by(ProductID=product.ProductID)
    for history in histories:
        db.session.delete(history)
    # 删除对应收藏
    favorites = Favorite.query.filter_by(UserID=user_id).all()
    for favorite in favorites:
        db.session.delete(favorite)

    db.session.add(new_order)
    db.session.commit()
    return jsonify({'message': 'Order added successfully'}), 200


# 获取好评榜单
@app.route('/toprating', methods=['GET'])
def get_toprating():
    try:
        toprating = TopRating.query.all()

        results = []
        for item in toprating:
            result = item.printTopRating()
            results.append(result)

        response_data = {
            'toprating_items': results,
            'total': len(results),
            'skip': 0,  # 你可能需要根据分页逻辑进行调整
            'limit': 30  # 你可能需要根据分页逻辑进行调整
        }

        return jsonify(response_data), 200
    except Exception as e:
        # 处理异常，返回适当的错误响应
        error_message = {'error': str(e)}
        return jsonify(error_message), 500


# 更新好评榜
def refresh_toprating():
    seller_avg_scores = (
        db.session.query(
            Product.SellerID,
            func.round(func.avg(Order.OrderScore), 1).label('avg_score')
        )
        .join(Order, Product.ProductID == Order.ProductID)
        .filter(Order.OrderScore != -1)  # 排除 OrderScore 为 -1 的情况
        .group_by(Product.SellerID)
        .order_by(desc('avg_score'))
        .all()
    )
    db.session.query(TopRating).delete()
    db.session.commit()

    for seller_id, avg_score in seller_avg_scores:
        new_top_rating = TopRating(
            RatingID=ratingid_generator.allocate_id(),
            UserID=seller_id,
            AverageRating=avg_score
        )
        db.session.add(new_top_rating)
        db.session.commit()


# 加入调度器任务
scheduler.add_job(refresh_toprating, 'cron', hour=12, minute=0, second=0)  # 设置为每天中午12:00:00


# 获取商品平台价格
@app.route('/price/<product_id>', methods=['GET'])
def get_product_price(product_id):
    try:
        prices = PlatformPrice.query.filter_by(ProductID=product_id).all()

        results = []
        for item in prices:
            result = item.printPlatformPrice()
            results.append(result)

        response_data = {
            'price_items': results,
            'total': len(results),
            'skip': 0,  # 你可能需要根据分页逻辑进行调整
            'limit': 30  # 你可能需要根据分页逻辑进行调整
        }

        return jsonify(response_data), 200
    except Exception as e:
        # 处理异常，返回适当的错误响应
        error_message = {'error': str(e)}
        return jsonify(error_message), 500


# 爬虫信息
def search_product_price(product_id):
    product = Product.query.filter_by(ProductID=product_id).first()

    product_json = jd.request_jingdong_and_parsel(product.ProductName)

    for productSearched in product_json["products"]:
        new_platform_price = PlatformPrice(
            PriceID=priceid_generator.allocate_id(),
            ProductID=product.ProductID,
            ProductName=productSearched["name"],
            PlatformName="jd",
            Price=productSearched["price"],
            ProductLink=productSearched["link"],
            PriceDate=datetime.now()
        )
        db.session.add(new_platform_price)
        db.session.commit()


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
        # 启动调度器
        scheduler.start()
        print("Database connected successfully.")
    except exc.SQLAlchemyError as e:
        print(f"Error connecting to the database: {str(e)}")


@app.cli.command()
def insert():
    insertUser()
    insertProducts()
    insertOrder()
    insertShoopingCart()
    insertFavorite()
    insertComment()
    insertReply()
    insertHistory()
    insertPlatformPrice()


def insertUser():
    # User
    # User
    new_user = User(
        UserID=userid_generator.allocate_id(),
        UserName="ShuaiGe",
        Password="88888888",
        Email="shuaige@buaa.edu.cn",
        UserType="normal",
        UserDescription="大家好，我是cjl，我是一个大帅哥，来自计算机学院",
        UserAvatar="1.jpg"
    )
    db.session.add(new_user)
    db.session.commit()

    new_user = User(
        UserID=userid_generator.allocate_id(),
        UserName="LiangZai",
        Password="88888888",
        Email="liangzai@buaa.edu.cn",
        UserType="normal",
        UserDescription="HAHAHAHAHAHAHA",
        UserAvatar="2.jpg"
    )
    db.session.add(new_user)
    db.session.commit()

    new_user = User(
        UserID=userid_generator.allocate_id(),
        UserName="user1",
        Password="88888888",
        Email="user1@buaa.edu.cn",
        UserType="normal",
        UserDescription="HAHAHAHAHAHAHA",
        UserAvatar="3.jpg"
    )
    db.session.add(new_user)
    db.session.commit()

    new_user = User(
        UserID=userid_generator.allocate_id(),
        UserName="user2",
        Password="88888888",
        Email="user2@buaa.edu.cn",
        UserType="normal",
        UserDescription="HAHAHAHAHAHAHA",
        UserAvatar="4.jpg"
    )
    db.session.add(new_user)
    db.session.commit()

    new_user = User(
        UserID=userid_generator.allocate_id(),
        UserName="user3",
        Password="88888888",
        Email="user3@buaa.edu.cn",
        UserType="normal",
        UserDescription="HAHAHAHAHAHAHA",
        UserAvatar="5.jpg"
    )
    db.session.add(new_user)
    db.session.commit()

    new_user = User(
        UserID=userid_generator.allocate_id(),
        UserName="user4",
        Password="88888888",
        Email="user4@buaa.edu.cn",
        UserType="normal",
        UserDescription="HAHAHAHAHAHAHA",
        UserAvatar="6.jpg"
    )
    db.session.add(new_user)
    db.session.commit()

    new_user = User(
        UserID=userid_generator.allocate_id(),
        UserName="user5",
        Password="88888888",
        Email="user5@buaa.edu.cn",
        UserType="normal",
        UserDescription="HAHAHAHAHAHAHA",
        UserAvatar="7.png"
    )
    db.session.add(new_user)
    db.session.commit()

    new_user = User(
        UserID=userid_generator.allocate_id(),
        UserName="user6",
        Password="88888888",
        Email="user6@buaa.edu.cn",
        UserType="normal",
        UserDescription="HAHAHAHAHAHAHA",
        UserAvatar="8.jpg"
    )
    db.session.add(new_user)
    db.session.commit()

    new_user = User(
        UserID=userid_generator.allocate_id(),
        UserName="user7",
        Password="88888888",
        Email="user7@buaa.edu.cn",
        UserType="normal",
        UserDescription="HAHAHAHAHAHAHA",
        UserAvatar="9.jpg"
    )
    db.session.add(new_user)
    db.session.commit()


def insertProducts():
    # Product
    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='iPhone 12',
        ProductCategory='电子设备',
        Description='之前买的，一直没用，现在想卖了',
        Price=2000.0,
        SellerID=1,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 1, 1, 12, 0, 0)
    )
    db.session.add(new_product)
    db.session.commit()
    search_product_price(new_product.ProductID)

    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='iPhone 12 pro',
        ProductCategory='电子设备',
        Description='之前买的，一直没用，现在想卖了',
        Price=2300.0,
        SellerID=1,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 1, 1, 12, 0, 0)
    )
    db.session.add(new_product)
    db.session.commit()
    search_product_price(new_product.ProductID)

    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='哈利波特英文书',
        ProductCategory='书籍文具',
        Description='故事书',
        Price=100.0,
        SellerID=2,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 1, 1, 12, 0, 0)
    )
    db.session.add(new_product)
    db.session.commit()
    search_product_price(new_product.ProductID)

    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='红色山地自行车 99新',
        ProductCategory='交通工具',
        Description='okasdijnjnkcakeeofiioncmmxnoi',
        Price=100.0,
        SellerID=3,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 1, 1, 12, 0, 0)
    )
    db.session.add(new_product)
    db.session.commit()
    search_product_price(new_product.ProductID)

    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='大一教材北航 工科数学分析',
        ProductCategory='书籍文具',
        Description='okasdijnjnkcakeeofiioncmmxnoi',
        Price=20.0,
        SellerID=4,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 5, 1, 10, 30, 0)
    )
    db.session.add(new_product)
    db.session.commit()
    search_product_price(new_product.ProductID)

    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='小提琴成人初学者入门级',
        ProductCategory='其他',
        Description='大学毕业了，准备卖掉',
        Price=180.0,
        SellerID=5,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 5, 1, 10, 30, 0)
    )
    db.session.add(new_product)
    db.session.commit()
    search_product_price(new_product.ProductID)

    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='周志华机器学习西瓜书，统计学习方法',
        ProductCategory='书籍文具',
        Description='这是好书',
        Price=50.0,
        SellerID=6,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 5, 3, 13, 30, 0)
    )
    db.session.add(new_product)
    db.session.commit()
    search_product_price(new_product.ProductID)

    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='9成新皮椅',
        ProductCategory='家具配饰',
        Description='舒服啊',
        Price=80.0,
        SellerID=6,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 5, 4, 16, 30, 0)
    )
    db.session.add(new_product)
    db.session.commit()
    search_product_price(new_product.ProductID)

    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='钢哑铃全新',
        ProductCategory='生活用品',
        Description='没事可以在宿舍锻炼身体',
        Price=80.0,
        SellerID=7,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 6, 1, 10, 39, 0)
    )
    db.session.add(new_product)
    db.session.commit()
    search_product_price(new_product.ProductID)


def insertOrder():
    seller = User.query.filter_by(UserID=4).first()

    new_order = Order(
        OrderID=orderid_generator.allocate_id(),
        UserID=2,
        ProductID=5,
        # Trading=seller.Email,
        OrderDate=datetime(2023, 5, 10, 10, 30, 0),
        OrderStatus="reserve",
        OrderScore=-1
    )
    db.session.add(new_order)
    db.session.commit()

    seller = User.query.filter_by(UserID=2).first()

    new_order = Order(
        OrderID=orderid_generator.allocate_id(),
        UserID=5,
        ProductID=3,
        # Trading=seller.Email,
        OrderDate=datetime(2023, 5, 10, 10, 30, 0),
        OrderStatus="finish",
        OrderScore=4
    )
    db.session.add(new_order)
    db.session.commit()

    seller = User.query.filter_by(UserID=1).first()

    new_order = Order(
        OrderID=orderid_generator.allocate_id(),
        UserID=4,
        ProductID=2,
        # Trading=seller.Email,
        OrderDate=datetime(2023, 5, 10, 10, 30, 0),
        OrderStatus="finish",
        OrderScore=5
    )
    db.session.add(new_order)
    db.session.commit()


def insertShoopingCart():
    new_shopping_cart = ShoppingCart(
        CartID=cartid_generator.allocate_id(),
        UserID=2,
        ProductID=1,
        Quantity=1
    )
    db.session.add(new_shopping_cart)
    db.session.commit()

    new_shopping_cart = ShoppingCart(
        CartID=cartid_generator.allocate_id(),
        UserID=3,
        ProductID=8,
        Quantity=1
    )
    db.session.add(new_shopping_cart)
    db.session.commit()

    new_shopping_cart = ShoppingCart(
        CartID=cartid_generator.allocate_id(),
        UserID=4,
        ProductID=8,
        Quantity=1
    )
    db.session.add(new_shopping_cart)
    db.session.commit()

    new_shopping_cart = ShoppingCart(
        CartID=cartid_generator.allocate_id(),
        UserID=3,
        ProductID=9,
        Quantity=1
    )
    db.session.add(new_shopping_cart)
    db.session.commit()


def insertFavorite():
    new_favorite = Favorite(
        FavoriteID=favouriteid_generator.allocate_id(),
        UserID=3,
        ProductID=6
    )
    db.session.add(new_favorite)
    db.session.commit()


def insertComment():
    new_comment = Comment(
        CommentID=commentid_generator.allocate_id(),
        AuthorUserID=1,
        TargetUserID=2,
        CommentText="thank you!",
        CommentDate=datetime(2023, 5, 15, 10, 30, 0),
    )
    db.session.add(new_comment)
    db.session.commit()


def insertReply():
    new_reply = Reply(
        ReplyID=replyid_generator.allocate_id(),
        CommentID=1,
        AuthorUserID=3,
        ReplyText="why",
        ReplyDate=datetime(2023, 6, 15, 10, 30, 0),
    )
    db.session.add(new_reply)
    db.session.commit()


def insertHistory():
    new_history = History(
        HistoryID=historyid_generator.allocate_id(),
        UserID=1,
        ProductID=1,
        OperationType="browse",
        RecordDate=datetime(2023, 6, 15, 10, 30, 0)
    )
    db.session.add(new_history)
    db.session.commit()


def insertPlatformPrice():
    new_platform_price = PlatformPrice(
        PriceID=priceid_generator.allocate_id(),
        ProductID=1,
        ProductName="iphone 12 官方",
        PlatformName="jd",
        Price=5888,
        ProductLink="ww.jd.com",
        PriceDate=datetime(2023, 7, 15, 10, 30, 0)
    )
    db.session.add(new_platform_price)
    db.session.commit()


@app.cli.command()
def drop():
    db.drop_all()


@app.cli.command()
def clear():
    db.drop_all()
    db.create_all()


@app.cli.command()
def refresh():
    refresh_toprating()


@app.cli.command()
def delete1():
    user_name = 'ShuaiGe'
    user = User.query.filter_by(UserName=user_name).first()
    if user:
        orders = Order.query.filter_by(UserID=user.UserID)
        for order in orders:
            db.session.delete(order)
            db.session.commit()
        shoppingCarts = ShoppingCart.query.filter_by(UserID=user.UserID)
        for shoppingCart in shoppingCarts:
            db.session.delete(shoppingCart)
            db.session.commit()
        favourites = Favorite.query.filter_by(UserID=user.UserID)
        for favourite in favourites:
            db.session.delete(favourite)
            db.session.commit()
        replies = Reply.query.filter_by(AuthorUserID=user.UserID)
        for reply in replies:
            db.session.delete(reply)
            db.session.commit()
        comments = Comment.query.filter_by(TargetUserID=user.UserID)
        for comment in comments:
            replies = Reply.query.filter_by(CommentID=comment.CommentID)
            for reply in replies:
                db.session.delete(reply)
                db.session.commit()
            db.session.delete(comment)
            db.session.commit()
        comments = Comment.query.filter_by(AuthorUserID=user.UserID)
        for comment in comments:
            replies = Reply.query.filter_by(CommentID=comment.CommentID)
            for reply in replies:
                db.session.delete(reply)
                db.session.commit()
            db.session.delete(comment)
            db.session.commit()
        histories = History.query.filter_by(UserID=user.UserID)
        for history in histories:
            db.session.delete(history)
            db.session.commit()
        topRatings = TopRating.query.filter_by(UserID=user.UserID)
        for topRating in topRatings:
            db.session.delete(topRating)
            db.session.commit()
        products = Product.query.filter_by(SellerID=user.UserID)
        for product in products:
            prices = PlatformPrice.query.filter_by(ProductID=product.ProductID)
            for price in prices:
                db.session.delete(price)
                db.session.commit()
            histories = History.query.filter_by(ProductID=product.ProductID)
            for history in histories:
                db.session.delete(history)
                db.session.commit()
            favourites = Favorite.query.filter_by(ProductID=product.ProductID)
            for favourite in favourites:
                db.session.delete(favourite)
                db.session.commit()
            shoppingCarts = ShoppingCart.query.filter_by(ProductID=product.ProductID)
            for shoppingCart in shoppingCarts:
                db.session.delete(shoppingCart)
                db.session.commit()
            orders = Order.query.filter_by(ProductID=product.ProductID)
            for order in orders:
                db.session.delete(order)
                db.session.commit()
            db.session.delete(product)
            db.session.commit()
        db.session.delete(user)
        db.session.commit()


if __name__ == '__main__':
    app.run(debug=True)
