const forge = require("node-forge");
let pki = forge.pki;

export function rsaOaepSha1AesGcm256HybridStringEncryption(publicKey, plaintext) {
    // generate random key
    let encryptionKey = generateRandomAesKey();
    // console.log(forge.util.bytesToHex(encryptionKey));
    // encrypt plaintext
    let ciphertextBase64 = aesGcmEncryptToBase64(encryptionKey, plaintext);
    // encrypt the aes encryption key with the rsa public key
    let encryptionKeyBase64 = rsaEncryptionOaepSha1(publicKey, encryptionKey);
    return encryptionKeyBase64 + ':' + ciphertextBase64;
}

export function rsaOaepSha1AesGcm256HybridStringDecryption(privateKey, completeCiphertext) {
    let dataSplit = completeCiphertext.split(":");
    let encryptionKeyReceived = base64Decoding(dataSplit[0]);
    let nonce = base64Decoding(dataSplit[1]);
    let ciphertext = base64Decoding(dataSplit[2]);
    let gcmTag = base64Decoding(dataSplit[3]);
    // decrypt the encryption key with the rsa private key
    let decryptionKey = rsaDecryptionOaepSha1(privateKey, encryptionKeyReceived);
    return aesGcmDecrypt(decryptionKey, nonce, ciphertext, gcmTag);
}

function aesGcmEncryptToBase64(key, data) {
    let nonce = generateRandomNonce();
    let cipher = forge.cipher.createCipher('AES-GCM', key);
    cipher.start({
        iv: nonce,
        tagLength: 128 // optional, defaults to 128 bits});
    });
    cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(data)));
    cipher.finish();
    let encrypted = cipher.output;
    let nonceBase64 = base64Encoding(nonce);
    let gcmTagBase64 = base64Encoding(cipher.mode.tag.data);
    let encryptedBase64 = base64Encoding(encrypted.getBytes());
    return nonceBase64 + ':' + encryptedBase64 + ':' + gcmTagBase64;
}

function aesGcmDecrypt(key, nonce, ciphertext, gcmTag) {
    let decCipher = forge.cipher.createDecipher('AES-GCM', key);
    decCipher.start({
        iv: nonce,
        tagLength: 128, // optional, defaults to 128 bits});
        tag: gcmTag // authentication tag from encryption
    });
    decCipher.update(forge.util.createBuffer(ciphertext));
    decCipher.finish();
    let aesDec = decCipher.output;
    return forge.util.decodeUtf8(aesDec);
}

function generateRandomAesKey() {
    return forge.random.getBytesSync(32);
}

function generateRandomNonce() {
    return forge.random.getBytesSync(12);
}

function rsaEncryptionOaepSha1(publicKeyPem, plaintext) {
    let publicKey = pki.publicKeyFromPem(publicKeyPem);
    let encrypted = publicKey.encrypt(plaintext, 'RSA-OAEP', {
        md: forge.md.sha1.create(),
        mgf1: {
            md: forge.md.sha1.create()
        }
    });
    return base64Encoding(encrypted);
}

function rsaDecryptionOaepSha1(privateKeyPem, ciphertext) {
    let privateKey = pki.privateKeyFromPem(privateKeyPem);
    let decrypted = privateKey.decrypt(ciphertext, 'RSA-OAEP', {
        md: forge.md.sha1.create(),
        mgf1: {
            md: forge.md.sha1.create()
        }
    });
    return decrypted.toString('utf8')
}

function base64Encoding(input) {
    return forge.util.encode64(input);
}

function base64Decoding(input) {
    return forge.util.decode64(input);
}
