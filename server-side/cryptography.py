from Crypto.PublicKey import RSA
from Crypto.Hash import SHA256
from base64 import b64decode, b64encode
from Crypto.Cipher import PKCS1_OAEP
import bcrypt


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


def get_hashed_password(plain_text_password):
    # Hash a password for the first time
    #   (Using bcrypt, the salt is saved into the hash itself)
    return bcrypt.hashpw(plain_text_password, bcrypt.gensalt())


def check_password(plain_text_password, hashed_password):
    # Check hashed password. Using bcrypt, the salt is saved into the hash itself
    return bcrypt.checkpw(bytes(plain_text_password, 'utf-8'), hashed_password.encode('utf-8'))
