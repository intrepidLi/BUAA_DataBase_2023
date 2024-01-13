# 环境
python 3.10

pip install -r requirements

# 数据库参数设置

``` python
HOST = '120.46.80.149'
PORT = '3306'
DATABASE = 'db21371245'
USERNAME = '21371245'
PASSWORD = 'Aa825915'
DB_URI = 'mysql+pymysql://{}:{}@{}:{}/{}'.format(USERNAME, PASSWORD, HOST, PORT, DATABASE)
DB_CHARSET = "utf8"  # 数据库连接编码
```

请将上述代码中的HOST,PORT,DATABASE,USERNAME,PASSWORD修改为自己数据库的相应参数。

# 初始化数据库

+ 第一次运行时，请先将`app2.py`作为`flask`主文件，运行`flask init`命令进行插入表格操作

+ 之后将`app.py`作为主文件，运行`flask insert`进行表格数据的插入，在数据库和表格已经存在的情况下，你无需进行第一步操作。

+ 如果你想清除表格数据并重新插入数据，请运行`flask clear`

+ 表格中初始化的数据请在这里查找

  + ``` python
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
    
    ```

  

# 运行
+ 运行`flask run`命令进行后端运行
+ 好评榜的即时刷新请使用`flask refresh`命令