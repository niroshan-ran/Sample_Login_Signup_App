import bcrypt
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import base64


def generate_key_file():
    # 1024 means the key_size will be 1024 bits
    key_pair = RSA.generate(2048)
    private_key = open("private_key.pem", "wb")
    private_key.write(key_pair.exportKey())
    private_key.close()
    public_key = open("public_key.pem", "wb")
    public_key.write(key_pair.publickey().exportKey())
    public_key.close()

    return key_pair


def decrypt_message(encrypted_message):
    private_key = open("private_key.pem").read()

    return rsaOaepSha1AesGcm256HybridStringDecryption(private_key, encrypted_message)


def encrypt_message(message, public_key):
    return rsaOaepSha1AesGcm256HybridStringEncryption(public_key, message)


def get_hashed_password(plain_text_password):
    # Hash a password for the first time
    #   (Using bcrypt, the salt is saved into the hash itself)
    return bcrypt.hashpw(bytes(plain_text_password, 'utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(plain_text_password, hashed_password):
    # Check hashed password. Using bcrypt, the salt is saved into the hash itself
    return bcrypt.checkpw(bytes(plain_text_password, 'utf-8'), hashed_password.encode('utf-8'))


def base64Encoding(input):
    dataBase64 = base64.b64encode(input)
    dataBase64P = dataBase64.decode("UTF-8")
    return dataBase64P


def base64Decoding(input):
    return base64.decodebytes(input.encode("ascii"))


def generateRandomAesKey():
    return get_random_bytes(32)


def generateRandomNonce():
    return get_random_bytes(12)


def rsaOaepSha1AesGcm256HybridStringEncryption(publicKeyPem, message):
    # generate random key
    encryptionKey = generateRandomAesKey()
    # encrypt plaintext
    ciphertextBase64 = aesGcmEncryptToBase64(encryptionKey, message)
    # encrypt the aes encryption key with the rsa public key
    encryptionKeyBase64 = base64Encoding(rsaEncryptionOaepSha1(publicKeyPem, encryptionKey))
    # complete output
    return encryptionKeyBase64 + ":" + ciphertextBase64


def rsaOaepSha1AesGcm256HybridStringDecryption(privateKeyPem, ciphertextDecryptionBase64):
    data = ciphertextDecryptionBase64.split(":")
    encryptionKeyReceived = base64Decoding(data[0])
    nonce = base64Decoding(data[1])
    encryptedData = base64Decoding(data[2])
    gcmTag = base64Decoding(data[3])
    decryptionKey = rsaDecryptionOaepSha1(privateKeyPem, encryptionKeyReceived)
    return aesGcmDecrypt(decryptionKey, nonce, encryptedData, gcmTag)


def aesGcmEncryptToBase64(encryptionKey, plaintext):
    nonce = generateRandomNonce()
    aad = b""
    cipher = AES.new(encryptionKey, AES.MODE_GCM, nonce=nonce)
    cipher.update(aad)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode("ascii"))
    nonceBase64 = base64Encoding(nonce)
    ciphertextBase64 = base64Encoding(ciphertext)
    gcmTagBase64 = base64Encoding(tag)
    return nonceBase64 + ":" + ciphertextBase64 + ":" + gcmTagBase64


def aesGcmDecrypt(decryptionKey, nonce, ciphertextDecryption, gcmTag):
    aad = b""
    cipher = AES.new(decryptionKey, AES.MODE_GCM, nonce=nonce)
    cipher.update(aad)
    decryptedText = cipher.decrypt_and_verify(ciphertextDecryption, gcmTag)
    decryptedTextP = decryptedText.decode("UTF-8")
    return decryptedTextP


def rsaEncryptionOaepSha1(publicKeyPem, aesKey):
    rsaPublicKey = RSA.import_key(publicKeyPem)
    cipher = PKCS1_OAEP.new(rsaPublicKey)
    ciphertext = cipher.encrypt(aesKey)
    return ciphertext


def rsaDecryptionOaepSha1(privateKeyPem, ciphertextBytes):
    rsaPrivateKey = RSA.import_key(privateKeyPem)
    cipher = PKCS1_OAEP.new(rsaPrivateKey)
    try:
        message = cipher.decrypt(ciphertextBytes)
        return message
    except (ValueError):
        return ""
