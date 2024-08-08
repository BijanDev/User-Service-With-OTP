const crypto = require('crypto');

// Function to generate a 6-digit numeric OTP based on a secret key
function generateNumericOTP(secret) {
    const time = Math.floor(Date.now() / 60000); // 30-second intervals
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'utf8'));
    hmac.update(Buffer.from(String(time), 'utf8'));

    const hmacResult = hmac.digest();
    const offset = hmacResult[hmacResult.length - 1] & 0xf;
    const otp = (
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff)
    ) % 1000000; // 6-digit numeric OTP

    return otp.toString().padStart(6, '0'); // Ensure 6 digits
}

// Function to verify if the provided OTP matches the generated OTP
function verifyNumericOTP(secret, otpToVerify) {
    const time = Math.floor(Date.now() / 30000); // 30-second intervals
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'utf8'));
    hmac.update(Buffer.from(String(time), 'utf8'));

    const hmacResult = hmac.digest();
    const offset = hmacResult[hmacResult.length - 1] & 0xf;
    const otpGenerated = (
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff)
    ) % 1000000; // 6-digit numeric OTP

    const otpFromUser = parseInt(otpToVerify, 10);

    return otpGenerated === otpFromUser;
}

module.exports = { generateNumericOTP, verifyNumericOTP };
