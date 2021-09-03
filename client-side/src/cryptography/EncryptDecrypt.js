import {
    rsaOaepSha1AesGcm256HybridStringDecryption,
    rsaOaepSha1AesGcm256HybridStringEncryption
} from "./ImportedFunctions";


export let encrypt_message = (message, key) => {
    return rsaOaepSha1AesGcm256HybridStringEncryption(key, message);
}

export let decrypt_message = (encrypted_msg, key) => {
    return rsaOaepSha1AesGcm256HybridStringDecryption(key, encrypted_msg);
}
