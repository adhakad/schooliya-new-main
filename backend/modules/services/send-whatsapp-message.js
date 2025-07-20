// 'use strict';
// const twilio = require('twilio');
// const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
// const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// let commonWhatsappMessage = async (message, phone) => {
//     try {
//         return await client.messages.create({
//             body: message,
//             from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
//             to: `whatsapp:+91${phone}`
//         });
//     }
//     catch (e) {
//         console.log(e)
//     }
// }
// let otpWhatsappMessage = async (otp, phone) => {
//     let msgbody =
//         `Your one time password OTP is: ${otp}`;
//     return commonWhatsappMessage(msgbody, phone)
// };

// module.exports = {
//     otpWhatsappMessage
// }
'use strict';
const axios = require('axios').default;
const { MSG91_AUTH_KEY } = process.env;
const MSG91_INTEGRATED_NUMBER = process.env.MSG91_INTEGRATED_NUMBER; // like "919691568729"
const MSG91_NAMESPACE = process.env.MSG91_NAMESPACE; // from MSG91 template
const MSG91_TEMPLATE_NAME = process.env.MSG91_TEMPLATE_NAME || "login_otp"; // approved template

const commonWhatsappMessage = async (otp, phone) => {
    try {
        const payload = {
            integrated_number: MSG91_INTEGRATED_NUMBER,
            content_type: "template",
            payload: {
                messaging_product: "whatsapp",
                type: "template",
                template: {
                    name: MSG91_TEMPLATE_NAME,
                    language: {
                        code: "en_GB",
                        policy: "deterministic"
                    },
                    to_and_components: [
                        {
                            to: [`91${phone}`], // phone without +, already prefixed with 91
                            components: {
                                body_1: {
                                    type: "text",
                                    value: otp
                                },
                                button_1: {
                                    subtype: "url",
                                    type: "text",
                                    value: otp
                                }
                            }
                        }
                    ]
                }
            }
        };

        const headers = {
            authkey: MSG91_AUTH_KEY,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        };

        const response = await axios.post(
            'https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
            payload,
            { headers }
        );

        return response.data;
    } catch (error) {
        console.error('MSG91 WhatsApp Error:', error.response?.data || error.message);
        throw new Error('WhatsApp OTP not sent');
    }
};

const otpWhatsappMessage = async (otp, phone) => {
    return await commonWhatsappMessage(otp, phone);
};

module.exports = {
    otpWhatsappMessage
};