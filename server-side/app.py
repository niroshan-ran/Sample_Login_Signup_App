import json
from flask_cors import CORS, cross_origin
from flask import Flask, request, jsonify
from Crypto.PublicKey import RSA
from dbconnect import DBConnector
import EncryptDecrypt as crypt

app = Flask(__name__)

CORS(app)

api_v2_cors_config = {
    "origins": ["http://localhost:3000/*"],
    "methods": ["OPTIONS", "GET", "POST"],
    "allow_headers": ["Authorization", "Content-Type"]
}


@app.route('/sign_in', methods=['POST'])
@cross_origin(**api_v2_cors_config)
def sign_in():
    dbcon = DBConnector()

    records = json.loads(request.data)

    query = "SELECT * FROM user_table WHERE email = %s"

    email = crypt.decrypt_message(records["email"])
    password = crypt.decrypt_message(records["password"])

    val = (email,)

    result = dbcon.execute_query(query, val)

    message = "Your Login Attempt Successfully Completed"

    client_public_key = records["client_public_key"]

    encrypted_message = crypt.encrypt_message(message, client_public_key)

    if len(result) > 0:
        match = crypt.check_password(password, result[0][1])
        return jsonify({"message": encrypted_message, "password_status": match, "email_status": True})
    else:
        return jsonify({"message": encrypted_message, "password_status": False, "email_status": False})


@app.route('/get_server_public_key_for_sign_in', methods=['GET'])
@cross_origin(**api_v2_cors_config)
def get_server_public_key_for_sign_in():
    keypair = crypt.generate_key_file()

    return jsonify({"server_public_key_1": keypair.public_key().export_key().decode()})


@app.route('/get_server_public_key', methods=['GET'])
@cross_origin(**api_v2_cors_config)
def get_server_public_key():
    keypair = crypt.generate_key_file()

    return jsonify({"server_public_key_1": keypair.public_key().export_key().decode()})


@app.route('/sign_up', methods=['POST'])
@cross_origin(**api_v2_cors_config)
def sign_up():
    dbcon = DBConnector()

    records = json.loads(request.data)

    query_user = "INSERT INTO user_table VALUES (%s, %s)"

    hash_password = crypt.get_hashed_password(crypt.decrypt_message(records["password"]))

    val_user = (
        crypt.decrypt_message(records["email"]),
        hash_password
    )

    dbcon.execute_query(query_user, val_user)
    dbcon.commit_database()

    client_public_key = records["client_public_key"]

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

    dbcon.execute_query(query_keys, val_keys)
    dbcon.commit_database()

    message = "Your Registration Attempt Successfully Completed"

    encrypted_message = crypt.encrypt_message(message, client_public_key)

    return jsonify({'message': encrypted_message, 'server_public_key_2': public_key2.exportKey().decode()})


if __name__ == '__main__':
    app.run(debug=True)
