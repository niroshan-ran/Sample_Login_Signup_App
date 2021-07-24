import base64
import json
from flask_cors import CORS, cross_origin
from flask import Flask, request, jsonify
import mysql.connector
from Crypto.Cipher import PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Hash import SHA256
from base64 import b64decode, b64encode

cnx = mysql.connector.connect(user='root', password='GRpP@&#^4n*6tz*g%E#f', host='localhost',
                              database='sample_schema')


def generate_key_file():
    # 1024 means the key_size will be 1024 bits
    key_pair = RSA.generate(1024)
    private_key = open("private_key.pem", "wb")
    private_key.write(key_pair.exportKey())
    private_key.close()
    public_key = open("public_key.pem", "wb")
    public_key.write(key_pair.publickey().exportKey())
    public_key.close()

    return key_pair


def decrypt_message(encrypted_message):
    key = RSA.importKey(open("private_key.pem").read())
    cipher = PKCS1_OAEP.new(key, hashAlgo=SHA256)
    decrypted_message = cipher.decrypt(b64decode(encrypted_message))
    return decrypted_message.decode()


def encrypt_message(message, public_key):
    key = RSA.importKey(public_key)
    cipher = PKCS1_OAEP.new(key, hashAlgo=SHA256)
    encrypted_message = cipher.encrypt(bytes(message, 'utf-8'))
    return b64encode(encrypted_message).decode('utf-8')


app = Flask(__name__)

CORS(app)
api_v2_cors_config = {
    "origins": ["http://localhost:3000",
                "https://raw.githubusercontent.com/juhoen/hybrid-crypto-js/master/web/hybrid-crypto.min.js"],
    "methods": ["OPTIONS", "GET", "POST"],
    "allow_headers": ["Authorization", "Content-Type"]
}


@app.route('/get_server_public_key', methods=['GET'])
@cross_origin(**api_v2_cors_config)
def get_server_public_key():
    generate_key_file()

    return jsonify({"server_public_key_1": generate_key_file().public_key().export_key().decode()})


@app.route('/sign_up', methods=['POST'])
@cross_origin(**api_v2_cors_config)
def sign_up():
    records = json.loads(request.data)

    query_user = "REPLACE INTO user_table VALUES (%s, %s)"

    my_cursor = cnx.cursor()

    val_user = (decrypt_message(records["email"]), decrypt_message(records["password"]))

    my_cursor.execute(query_user, val_user)

    row_count = my_cursor.rowcount

    my_cursor = cnx.cursor()

    client_public_key = records["client_public_key"]

    private_key1 = RSA.importKey(open("private_key.pem").read())
    public_key1 = RSA.importKey(open("public_key.pem").read())

    private_key2 = generate_key_file()
    public_key2 = private_key2.public_key()

    query_keys = "INSERT IGNORE INTO server_key_table " \
                 "(public_key_1, private_key_1, public_key_2, private_key_2, client_public_key) " \
                 "VALUES (%s, %s, %s, %s, %s)"
    val_keys = (
        public_key1.exportKey().decode(), private_key1.exportKey().decode(), public_key2.exportKey().decode(),
        private_key2.exportKey().decode(),
        str.encode(client_public_key).decode())

    my_cursor.execute(query_keys, val_keys)

    message = str(f"Successfully Inserted Records {row_count}")

    encrypted_row_count = encrypt_message(message, client_public_key)

    cnx.commit()
    my_cursor.close()

    return jsonify({'row_count': encrypted_row_count, 'server_public_key_2': public_key2.exportKey().decode()})


if __name__ == '__main__':
    app.run(debug=True)
