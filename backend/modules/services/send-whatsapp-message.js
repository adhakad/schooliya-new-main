'use strict';
const twilio = require('twilio');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

let commonWhatsappMessage = async (message, phone) => {
    try {
        return await client.messages.create({
            body: message,
            from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:+91${phone}`
        });
    }
    catch (e) {
        console.log(e)
    }
}
let otpWhatsappMessage = async (otp, phone) => {
    let msgbody =
        `Your one time password OTP is: ${otp}`;
    return commonWhatsappMessage(msgbody, phone)
};

module.exports = {
    otpWhatsappMessage
}
