import json
import os

import waitress

from flask import Flask, request, jsonify, render_template, render_template_string
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect, generate_csrf

import password_hash as crypt
from database_management import DBConnector

# Constants

API = '/api'

SIGN_UP = '%s/sign_up' % API

GET_SERVER_PUBLIC_KEY = '%s/get_server_public_key' % API

SIGN_IN = '%s/sign_in' % API

# End of Constants

app = Flask(__name__, static_folder="../client-side/build/static", template_folder="../client-side/build")

csrfApp = CSRFProtect(app)

app.secret_key = os.urandom(25)

app.config.update(SESSION_COOKIE_HTTPSONLY=True,
                  SESSION_COOKIE_SAMESITE='Strict',
                  SESSION_COOKIE_SECURE=True)


@app.after_request
def apply_caching(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers['X-Content-Type-Options'] = "nosniff"

    return response


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    generate_csrf()
    return render_template("index.html")


api_v2_cors_config = {
    "origins": ["https://cfb0-2402-4000-2280-e656-f952-8e07-fb42-1248.ngrok.io"],
    "methods": ["HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE", "GET"],
    "allow_headers": ["Authorization", "Content-Type", "X-Frame-Options", 'X-Content-Type-Options', "Cache-Control",
                      "Pragma", "Expires"]
}

CORS(app, **api_v2_cors_config)


@app.route(SIGN_IN, methods=['POST', 'GET'])
def sign_in():
    if request.method != "POST":
        return render_template_string("<h1>Direct API access not Allowed</h1>"), 400

    dbConnection = DBConnector()

    records = json.loads(request.data)

    email = records["email"]
    password = records["password"]

    result = check_email_exists(dbConnection, email)

    message = "Your Login Attempt Successfully Completed"

    email_exists = len(result) > 0

    password_matches = False
    encrypted_message = ""
    firstName = ""
    lastName = ""
    generalUser = True
    email = ""

    if email_exists:
        password_matches = crypt.check_password(password, result[0][1])

    if password_matches:
        firstName = result[0][2]
        lastName = result[0][3]
        generalUser = evaluateIntValueToBool(int(result[0][4]))
        email = result[0][0]

    return jsonify({
        "message": message,
        "password_status": password_matches,
        "email_status": email_exists,
        "user_email": email,
        "user_firstname": firstName,
        "user_lastname": lastName,
        "is_general_user": generalUser,
    })


def check_email_exists(dbConnection, email):
    query = "SELECT * FROM user_table WHERE email = %s"
    val = (email,)
    result = dbConnection.execute_query(query, val)
    return result


def evaluateBooleanValueToInt(val: bool):
    if not bool:
        return 0
    else:
        return 1


def evaluateIntValueToBool(val: int):
    if val == 0:
        return False
    else:
        return True


@app.route(SIGN_UP, methods=['POST', 'GET'])
def sign_up():
    if request.method != "POST":
        return render_template_string("<h1>Direct API access not Allowed</h1>"), 400

    dbConnection = DBConnector()

    records = json.loads(request.data)

    email = records["email"]

    email_exists = len(check_email_exists(dbConnection, email)) > 0

    message = "Your Registration Attempt Successfully Completed"

    if not email_exists:
        query_user = "INSERT INTO user_table VALUES (%s, %s, %s, %s, %s)"

        hash_password = crypt.get_hashed_password(records["password"])

        firstname = records["firstName"]
        lastname = records["lastName"]

        generalUser = evaluateBooleanValueToInt(True)

        val_user = (
            email,
            hash_password,
            firstname,
            lastname,
            generalUser
        )

        dbConnection.execute_query(query_user, val_user)
        dbConnection.commit_database()

    return jsonify({'message': message, "email_status": email_exists})


if __name__ == '__main__':
    waitress.serve(app, host='0.0.0.0', port=80)
