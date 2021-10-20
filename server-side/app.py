import json
import os

from Crypto.PublicKey import RSA
from flask import Flask, request, jsonify, render_template, render_template_string
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect, generate_csrf

import EncryptDecrypt as crypt
from dbconnect import DBConnector

# Constants

API = '/api'

SIGN_UP = '%s/sign_up' % API

GET_SERVER_PUBLIC_KEY = '%s/get_server_public_key' % API

SIGN_IN = '%s/sign_in' % API

# End of Constants

app = Flask(__name__, static_folder="../client-side/build/static", template_folder="../client-side/build")

csrfApp = CSRFProtect(app)

app.secret_key = os.urandom(25)

app.config.update(SESSION_COOKIE_HTTPONLY=True,
                  SESSION_COOKIE_SAMESITE='Strict')


@app.after_request
def apply_caching(response):
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers['X-Content-Type-Options'] = "nosniff"
    return response


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    generate_csrf()
    return render_template("index.html")


api_v2_cors_config = {
    "origins": ["http://localhost:3000/*", "http://localhost:5000/*"],
    "methods": ["HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE", "GET"],
    "allow_headers": ["Authorization", "Content-Type"]
}

CORS(app, **api_v2_cors_config)


@app.route(SIGN_IN, methods=['POST', 'GET'])
def sign_in():
    if request.method != "POST":
        return render_template_string("<h1>Direct API access not Allowed</h1>"), 400

    dbConnection = DBConnector()

    records = json.loads(request.data)

    email = crypt.decrypt_message(records["email"])
    password = crypt.decrypt_message(records["password"])

    result = check_email_exists(dbConnection, email)

    message = "Your Login Attempt Successfully Completed"

    client_public_key = records["client_public_key"]

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
        encrypted_message = crypt.encrypt_message(message, client_public_key)
        firstName = crypt.encrypt_message(result[0][2], client_public_key)
        lastName = crypt.encrypt_message(result[0][3], client_public_key)
        generalUser = evaluateIntValueToBool(int(result[0][4]))
        email = crypt.encrypt_message(result[0][0], client_public_key)

    public_key2 = save_exchange_keys_to_db(client_public_key, dbConnection)

    return jsonify({"message": encrypted_message,
                    "password_status": password_matches,
                    "email_status": email_exists,
                    "user_email": email,
                    "user_firstname": firstName,
                    "user_lastname": lastName,
                    "is_general_user": generalUser,
                    'server_public_key_2': public_key2.exportKey().decode()})


def check_email_exists(dbConnection, email):
    query = "SELECT * FROM user_table WHERE email = %s"
    val = (email,)
    result = dbConnection.execute_query(query, val)
    return result


@app.route(GET_SERVER_PUBLIC_KEY, methods=['POST', 'GET'])
def get_server_public_key():
    if request.method != "POST":
        return render_template_string("<h1>Direct API access not Allowed</h1>"), 400

    keypair = crypt.generate_key_file()

    return jsonify({"server_public_key_1": keypair.public_key().export_key().decode()})


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

    email = crypt.decrypt_message(records["email"])

    email_exists = len(check_email_exists(dbConnection, email)) > 0

    client_public_key = records["client_public_key"]

    message = "Your Registration Attempt Successfully Completed"

    encrypted_message = ""

    if not email_exists:
        query_user = "INSERT INTO user_table VALUES (%s, %s, %s, %s, %s)"

        hash_password = crypt.get_hashed_password(crypt.decrypt_message(records["password"]))

        firstname = crypt.decrypt_message(records["firstName"])
        lastname = crypt.decrypt_message(records["lastName"])

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

        encrypted_message = crypt.encrypt_message(message, client_public_key)

    public_key2 = save_exchange_keys_to_db(client_public_key, dbConnection)

    return jsonify({'message': encrypted_message, "email_status": email_exists,
                    'server_public_key_2': public_key2.exportKey().decode()})


def save_exchange_keys_to_db(client_public_key, dbConnection):
    private_key1 = RSA.importKey(open("private_key.pem").read())
    public_key1 = RSA.importKey(open("public_key.pem").read())
    private_key2 = crypt.generate_key_file()
    public_key2 = private_key2.public_key()
    query_keys = "INSERT INTO server_key_table " \
                 "(public_key_1, private_key_1, public_key_2, private_key_2, client_public_key) " \
                 "VALUES (%s, %s, %s, %s, %s)"
    val_keys = (
        public_key1.exportKey().decode(), private_key1.exportKey().decode(), public_key2.exportKey().decode(),
        private_key2.exportKey().decode(),
        str.encode(client_public_key).decode())
    dbConnection.execute_query(query_keys, val_keys)
    dbConnection.commit_database()
    return public_key2


if __name__ == '__main__':
    from waitress import serve

    serve(app, host="0.0.0.0", port=8085)
