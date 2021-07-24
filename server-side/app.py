import json
from flask_cors import CORS, cross_origin
from flask import Flask, request, jsonify
import mysql.connector
from Crypto.Cipher import PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Hash import SHA256
from base64 import b64decode

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

    return key_pair.publickey()


def decrypt_message(encrypted_message):
    key = RSA.importKey(open("private_key.pem").read())
    cipher = PKCS1_OAEP.new(key, hashAlgo=SHA256)
    decrypted_message = cipher.decrypt(b64decode(encrypted_message))
    return decrypted_message.decode()


# def encrypt_message(message):
#    key = RSA.importKey(open("public_key.pem").read())
#    cipher = PKCS1_OAEP.new(key, hashAlgo=SHA256)
#    decrypted_message = cipher.encrypt(b64decode(encrypted_message))


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

    return jsonify({"public_key": generate_key_file().export_key().decode()})


@app.route('/sign_up', methods=['POST'])
@cross_origin(**api_v2_cors_config)
def sign_up():
    records = json.loads(request.data)
    print(records["email"])
    print(decrypt_message(records["email"]))
    print(decrypt_message(records["password"]))
    # query_user = "INSERT INTO user_table VALUES (%s, %s)"
    #
    # my_cursor = cnx.cursor()
    #
    # val_user = (decrypt_message(records["email"], private_key1), decrypt_message((records["password"]), private_key1))
    #
    # print(val_user)
    # my_cursor.execute(query_user, val_user)
    # cnx.commit()
    #
    # row_count = my_cursor.rowcount
    #
    # my_cursor = cnx.cursor()
    #
    # global private_key2, public_key2
    #
    # key = RSA.import_key(decrypt_message(records["client_public_key"], private_key1),
    #                      "sample pass phrase")
    # client_public_key = rsa.PublicKey(n=key.n, e=key.e)
    #
    # query_keys = "INSERT INTO server_key_table VALUES (%s, %s, %s, %s, %s)"
    # val_keys = (public_key1.exportKey().decode(), private_key1.exportKey().decode(), public_key2.exportKey().decode(),
    #             private_key2.exportKey().decode(), key.exportKey().decode())
    #
    # my_cursor.execute(query_keys, val_keys)
    #
    # cnx.commit()
    #
    # encrypted_row_count = encrypt_message(row_count, client_public_key)
    # encrypted_server_public_key_2 = encrypt_message(public_key2.exportKey().decode(), client_public_key)
    #
    # my_cursor.close()
    # return jsonify({'row_count': encrypted_row_count, 'server_public_key_2': encrypted_server_public_key_2})

    return ""


if __name__ == '__main__':
    app.run(debug=True)
