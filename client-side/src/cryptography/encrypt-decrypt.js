import Forge from "node-forge";


export let encrypt_message = (a_message, pubkey) => {


    let publicKey = Forge.pki.publicKeyFromPem(pubkey);
    let encrypted = publicKey.encrypt(a_message, "RSA-OAEP", {
        md: Forge.md.sha256.create(),
        mgf1: Forge.mgf1.create()
    });
    return Forge.util.encode64(encrypted);

}

export let decrypt_message = (encrypted_msg, rsakey) => {

    let privateKey = Forge.pki.privateKeyFromPem(rsakey);
    return privateKey.decrypt(Forge.util.decode64(encrypted_msg), "RSA-OAEP", {
        md: Forge.md.sha256.create(),
        mgf1: Forge.mgf1.create()
    });

}
