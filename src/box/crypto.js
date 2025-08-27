module.exports = async function () {
    ginger(async function ($g) {
        const crypto = require('crypto');

        const input = "hello world";
        const secret = "my-super-secret-key";
        const userPassword = "Password123!";

        const crc32Result = crypto.CRC32(input);
        const md5Result = crypto.MD5(input);
        const sha2Result = crypto.SHA2(input);
        const sha3Result = crypto.SHA3(input);

        const hmacSignature = crypto.hmacSha256Encrypt(input, secret);
        const isSignatureValid = crypto.hmacSha256Verify(hmacSignature, input, secret);
        const isSignatureInvalid = crypto.hmacSha256Verify(hmacSignature, "hello world!", secret); // Different input

        const secretMessage = "This is a secret message for user 42.";
        const encryptedData = crypto.encrypt(secretMessage, secret);
        const decryptedMessage = crypto.decrypt(encryptedData, secret);
        const failedDecryption = crypto.decrypt(encryptedData, "wrong-secret");

        const passwordHash = await crypto.hashPassword(userPassword);
        const isPasswordCorrect = await crypto.verifyPassword(userPassword, passwordHash);
        const isPasswordIncorrect = await crypto.verifyPassword("wrong_password", passwordHash);

        const apiKey = crypto.generateSecureRandomString(32);
        const sessionId = crypto.generateSecureRandomString(24);
        const withoutNumbers = crypto.generateSecureRandomString(24, true);

        const responseData = {
            inputString: input,
            hashes: {
                crc32: crc32Result,
                md5: md5Result,
                sha256: sha2Result,
                sha3_256: sha3Result,
            },
            hmac: {
                secretKey: "hidden-for-security",
                signature: hmacSignature,
                verification: {
                    "check_with_correct_data": isSignatureValid, // Should be true
                    "check_with_incorrect_data": isSignatureInvalid, // Should be false
                }
            },
            encryption: {
                original_message: secretMessage,
                encrypted_package: encryptedData,
                decrypted_message: decryptedMessage,
                failed_decryption_result: failedDecryption // Should be null
            },
            random_strings: {
                generated_api_key: apiKey,
                generated_session_id: sessionId,
                without_numbers: withoutNumbers
            },
            password: {
                original: userPassword,
                hash: passwordHash,
                verification: {
                    correct_password_check: isPasswordCorrect, // Should be true
                    incorrect_password_check: isPasswordIncorrect // Should be false
                }
            }
        };

        $g.response.send(responseData);
    });
};
