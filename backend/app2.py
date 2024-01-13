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
HOST = '127.0.0.1'
PORT = '3306'
DATABASE = 'database_project'
USERNAME = 'root'
# PASSWORD = 'mysql'
PASSWORD = '990516lyT?*k'
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

'''
Allocate
'''


class IDGenerator:
    def __init__(self):
        self.current_id = 0

    def allocate_id(self):
        self.current_id += 1
        return self.current_id


# 创建 IDGenerator 实例
userid_generator = IDGenerator()
productid_generator = IDGenerator()
orderid_generator = IDGenerator()
cartid_generator = IDGenerator()
favouriteid_generator = IDGenerator()
commentid_generator = IDGenerator()
replyid_generator = IDGenerator()
historyid_generator = IDGenerator()
ratingid_generator = IDGenerator()
priceid_generator = IDGenerator()
'''
Models
'''


# 用户表 (Users)
class User(UserMixin, db.Model):
    __tablename__ = 'users'

    UserID = db.Column(db.Integer, primary_key=True)
    UserName = db.Column(db.String(64), nullable=False, unique=True)
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
    ProductState = db.Column(db.String(10), nullable=False,default='available')
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


# new_product = Product(
#     ProductID=,
#     ProductName="",
#     ProductCategory="",
#     Description="",
#     Price=,
#     SellerID=,
#     ProductState="",
#     ReleaseDate=datetime.datetime.now()
# )

# 订单表 (Orders)
class Order(db.Model):
    __tablename__ = 'orders'

    OrderID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'))
    Trading = db.Column(db.String(64))
    OrderDate = db.Column(db.DateTime)
    OrderStatus = db.Column(db.String(64))
    OrderScore = db.Column(db.Integer, default=0)

    __table_args__ = (
        db.CheckConstraint(OrderStatus.in_(['reserve', 'finish']), name='checkOrderStatus'),
    )

    def printOrder(self):
        order_data = {
            'OrderID': self.OrderID,
            'UserID': self.UserID,
            'ProductID': self.ProductID,
            'Trading': self.Trading,
            'OrderDate': self.OrderDate.strftime('%Y-%m-%d %H:%M:%S') if self.OrderDate else None,
            'OrderStatus': self.OrderStatus,
            'OrderScore': self.OrderScore
        }
        return order_data


# new_order = Order(
#     OrderID=,
#     UserID=,
#     ProductID=,
#     Trading="",
#     OrderDate=datetime.datetime.now(),
#     OrderStatus="",
#     OrderScore=
# )

# 购物车表 (ShoppingCart)
class ShoppingCart(db.Model):
    __tablename__ = 'shoppingcart'

    CartID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'))
    Quantity = db.Column(db.Integer, default=1)

    def printShoppingCart(self):
        cart_data = {
            'CartID': self.CartID,
            'UserID': self.UserID,
            'ProductID': self.ProductID,
            'Quantity': self.Quantity
        }
        return cart_data


# new_shopping_cart = ShoppingCart(
#     CartID=,
#     UserID=,
#     ProductID=,
#     Quantity=
# )

# 收藏表 (Favorites)
class Favorite(db.Model):
    __tablename__ = 'favorites'

    FavoriteID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'))

    def printFavorite(self):
        favorite_data = {
            'FavoriteID': self.FavoriteID,
            'UserID': self.UserID,
            'ProductID': self.ProductID
        }
        return favorite_data


# new_favorite = Favorite(
#     FavoriteID=,
#     UserID=,
#     ProductID=
# )

# 评论表 (Comments)
class Comment(db.Model):
    __tablename__ = 'comments'

    CommentID = db.Column(db.Integer, primary_key=True)
    AuthorUserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    TargetUserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
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


# new_comment = Comment(
#     CommentID=,
#     AuthorUserID=,
#     TargetUserID=,
#     CommentText="",
#     CommentDate=datetime.datetime.now()
# )

# 回复评论表 (Replies)
class Reply(db.Model):
    __tablename__ = 'replies'

    ReplyID = db.Column(db.Integer, primary_key=True)
    CommentID = db.Column(db.Integer, db.ForeignKey('comments.CommentID'))
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


# new_reply = Reply(
#     ReplyID=,
#     CommentID=,
#     AuthorUserID=,
#     ReplyText="",
#     ReplyDate=datetime.datetime.now()
# )

# 历史记录关系表 (History)
class History(db.Model):
    __tablename__ = 'history'

    HistoryID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'))
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


# new_history = History(
#     HistoryID=,
#     UserID=,
#     ProductID=,
#     OperationType="",
#     RecordDate=datetime.datetime.now()
# )

# 商家好评榜表（TopRating)
class TopRating(db.Model):
    __tablename__ = 'toprating'

    RatingID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('users.UserID'))
    AverageRating = db.Column(db.Float)
    TotalRatings = db.Column(db.Integer)

    def printTopRating(self):
        top_rating_data = {
            'RatingID': self.RatingID,
            'UserID': self.UserID,
            'AverageRating': self.AverageRating,
            'TotalRatings': self.TotalRatings
        }
        return top_rating_data


# new_top_rating = TopRating(
#     RatingID=,
#     UserID=,
#     AverageRating=,
#     TotalRatings=
# )

# 商品平台价格表 (PlatformPrices)
class PlatformPrice(db.Model):
    __tablename__ = 'platformprices'

    PriceID = db.Column(db.Integer, primary_key=True)
    ProductID = db.Column(db.Integer, db.ForeignKey('products.ProductID'))
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


# new_platform_price = PlatformPrice(
#     PriceID=,
#     ProductID=,
#     ProductName="",
#     PlatformName="",
#     Price=,
#     ProductLink="",
#     PriceDate=datetime.datetime.now()
# )


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


@app.route('/images/products/<int:ProductID>', methods=['GET'])
def get_product_image(ProductID):
    product = Product.query.filter_by(ProductID=ProductID).first()
    folder_path = f'./images/products/{ProductID}/'

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


@app.route('/auth/register', methods=['GET', 'POST'])
def register():
    data = request.get_json()

    username = data['username']
    password = data['password']
    email = data['email']

    print("ok")

    user = User.query.filter_by(UserName=username).first()
    globalUserID = db.session.query(func.max(User.UserID)).scalar()
    if user is None:
        new_user = User(
            UserID=userid_generator.allocate_id(),
            UserName=username,
            Password=password,
            Email=email,
            UserType="normal",
            UserDescription="用几句话介绍一下自己吧",
            UserAvatar="./images/users/default.jpg"
        )
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        access_token = create_access_token(identity=username)
        return jsonify(token=access_token, username=username), 200
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
        error_message = {'message': 'Invalid Username or Password'}
        return jsonify(error_message), 401


@app.route('/users/<user_name>', methods=['GET'])
def get_user(user_name):
    user = User.query.filter(User.UserName == user_name).first()
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
@app.route('/users/<user_name>', methods=['DELETE'])
def delete_user(user_name):
    user = User.query.filter_by(UserName=user_name).first()
    user = User.query.filter_by(UserName=user_name).first()
    if user:
        db.session.delete(user)
        db.session.commit()  # 注意这里的正确调用方式
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
    products = Product.query.all()

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
@app.route('/product/add', methods=['GET'])
def add_product():
    ProductName = request.form.get('ProductName')
    ProductCategory = request.form.get('ProductCategory')
    Description = request.form.get('Description')
    Price = request.form.get('Price')
    SellerID = request.form.get('SellerID')
    # productState不用，默认available

    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName=ProductName,
        ProductCategory=ProductCategory,
        Description=Description,
        Price=Price,
        SellerID=SellerID,  # 请根据实际情况设置卖家ID
        ReleaseDate=datetime.now()
    )

    if 'image' in request.files:
        image = request.files['image']
        # 保存文件到服务器
        if image.filename != '':
            # 确保目录存在，如果不存在就创建
            os.makedirs(app.config[new_product.ProductID], exist_ok=True)

            # 保存文件到指定目录
            filepath = os.path.join(app.config[new_product.ProductID], 'default')
            image.save(filepath)

    db.session.add(new_product)
    db.session.commit()

@app.route('/product/<product_id>')
def get_product(product_id):
    product = Product.query.get(product_id)

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


@app.route('/orders/<user_id>', methods=['GET', 'POST'])
def get_orders(user_id):
    try:
        orders = Order.query.get(UserID=user_id).all()

        results = []
        for order in orders:
            result = {
                'OrderID': order.OrderID,
                'UserID': order.UserID,
                'ProductID': order.ProductID,
                'Trading': order.Trading,
                'OrderDate': order.OrderDate,
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


# 获取购物车
@app.route('/shoppingcart/<user_id>', methods=['GET', 'POST'])
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
    new_user = User(
        UserID=userid_generator.allocate_id(),
        UserName="Shuai Ge",
        Password="88888888",
        Email="shuaige@buaa.edu.cn",
        UserType="normal",
        UserDescription="HAHAHAHAHAHAHA",
        UserAvatar="user1.jpg"
    )
    db.session.add(new_user)
    db.session.commit()

    new_user = User(
        UserID=userid_generator.allocate_id(),
        UserName="Liang Zai",
        Password="88888888",
        Email="liangzai@buaa.edu.cn",
        UserType="normal",
        UserDescription="HAHAHAHAHAHAHA",
        UserAvatar="user2.jpg"
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
        UserAvatar="user3.jpg"
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
        UserAvatar="user4.jpg"
    )
    db.session.add(new_user)
    db.session.commit()


def insertProducts():
    # Product
    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='iPhone 12',
        ProductCategory='Smartphones',
        Description='The latest iPhone model',
        Price=5999.9,
        SellerID=1,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 1, 1, 12, 0, 0)
    )
    db.session.add(new_product)
    db.session.commit()

    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='iPhone 12 pro',
        ProductCategory='Smartphones',
        Description='The latest iPhone model',
        Price=6999.9,
        SellerID=1,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 1, 1, 12, 0, 0)
    )
    db.session.add(new_product)
    db.session.commit()

    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='HarryPotter',
        ProductCategory='Books',
        Description='Story Books',
        Price=100.0,
        SellerID=2,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 1, 1, 12, 0, 0)
    )
    db.session.add(new_product)
    db.session.commit()

    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='Bicycle',
        ProductCategory='Transportation',
        Description='okasdijnjnkcakeeofiioncmmxnoi',
        Price=100.0,
        SellerID=3,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 1, 1, 12, 0, 0)
    )
    db.session.add(new_product)
    db.session.commit()

    new_product = Product(
        ProductID=productid_generator.allocate_id(),
        ProductName='工科数学分析',
        ProductCategory='Books',
        Description='okasdijnjnkcakeeofiioncmmxnoi',
        Price=100.0,
        SellerID=2,  # 请根据实际情况设置卖家ID
        ProductState='available',
        ReleaseDate=datetime(2023, 5, 1, 10, 30, 0)
    )
    db.session.add(new_product)
    db.session.commit()


def insertOrder():
    seller = User.query.filter_by(UserID=2).first()

    new_order = Order(
        OrderID=orderid_generator.allocate_id(),
        UserID=2,
        ProductID=2,
        Trading=seller.Email,
        OrderDate=datetime(2023, 5, 10, 10, 30, 0),
        OrderStatus="reserve",
        OrderScore=0
    )
    db.session.add(new_order)
    db.session.commit()


def insertShoopingCart():
    new_shopping_cart = ShoppingCart(
        CartID=cartid_generator.allocate_id(),
        UserID=1,
        ProductID=1,
        Quantity=1
    )
    db.session.add(new_shopping_cart)
    db.session.commit()

    new_shopping_cart = ShoppingCart(
        CartID=cartid_generator.allocate_id(),
        UserID=1,
        ProductID=2,
        Quantity=1
    )
    db.session.add(new_shopping_cart)
    db.session.commit()

    new_shopping_cart = ShoppingCart(
        CartID=cartid_generator.allocate_id(),
        UserID=1,
        ProductID=3,
        Quantity=1
    )
    db.session.add(new_shopping_cart)
    db.session.commit()

    new_shopping_cart = ShoppingCart(
        CartID=cartid_generator.allocate_id(),
        UserID=3,
        ProductID=4,
        Quantity=1
    )
    db.session.add(new_shopping_cart)
    db.session.commit()


def insertFavorite():
    new_favorite = Favorite(
        FavoriteID=favouriteid_generator.allocate_id(),
        UserID=3,
        ProductID=2
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


if __name__ == '__main__':
    app.run(debug=True)
