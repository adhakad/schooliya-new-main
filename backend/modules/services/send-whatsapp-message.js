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

const sendFeesConfirmationWithoutReceipt = async (phone, valuesArray = []) => {
    try {
        const payload = {
            integrated_number: process.env.MSG91_INTEGRATED_NUMBER,
            content_type: "template",
            payload: {
                messaging_product: "whatsapp",
                type: "template",
                template: {
                    name: "fee_confirmation_without_reciept",
                    language: {
                        code: "en",
                        policy: "deterministic"
                    },
                    namespace: "bc6d378a_4d7e_4e78_a870_75883411b711",
                    to_and_components: [
                        {
                            to: [`91${phone}`],
                            components: valuesArray.reduce((acc, val, index) => {
                                acc[`body_${index + 1}`] = {
                                    type: "text",
                                    value: val
                                };
                                return acc;
                            }, {})
                        }
                    ]
                }
            }
        };

        const headers = {
            authkey: process.env.MSG91_AUTH_KEY,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        };

        const response = await axios.post(
            'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
            payload,
            { headers }
        );

        return response.data;
    } catch (error) {
        console.error('MSG91 WhatsApp Error:', error.response?.data || error.message);
        throw new Error('WhatsApp message not sent');
    }
};


const sendFeesReminderMessage = async (phone, school_name, father_name, pending_amount, student_name, class_name, last_date) => {
    try {
        const payload = {
            integrated_number: process.env.MSG91_INTEGRATED_NUMBER,
            content_type: "template",
            payload: {
                messaging_product: "whatsapp",
                type: "template",
                template: {
                    name: "fee_reminder",
                    language: {
                        code: "en",
                        policy: "deterministic"
                    },
                    namespace: "bc6d378a_4d7e_4e78_a870_75883411b711",
                    to_and_components: [
                        {
                            to: [`91${phone}`],
                            "components": {
                                "body_1": {
                                    "type": "text",
                                    "value": school_name
                                },
                                "body_2": {
                                    "type": "text",
                                    "value": father_name
                                },
                                "body_3": {
                                    "type": "text",
                                    "value": pending_amount
                                },
                                "body_4": {
                                    "type": "text",
                                    "value": student_name
                                },
                                "body_5": {
                                    "type": "text",
                                    "value": class_name
                                },
                                "body_6": {
                                    "type": "text",
                                    "value": last_date
                                },
                            }
                        }
                    ]
                }
            }
        };

        const headers = {
            authkey: process.env.MSG91_AUTH_KEY,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        };

        const response = await axios.post(
            'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
            payload,
            { headers }
        );

        return response.data;
    } catch (error) {
        console.error('MSG91 WhatsApp Error:', error.response?.data || error.message);
        throw new Error('WhatsApp message not sent');
    }
};

const otpWhatsappMessage = async (otp, phone) => {
    return await commonWhatsappMessage(otp, phone);
};
const feesConfirmationMessage = async (phone, valuesArray) => {
    return await sendFeesConfirmationWithoutReceipt(phone, valuesArray);
};
const feesReminderMessage = async (phone, school_name, father_name, pending_amount, student_name, class_name, last_date) => {
    return await sendFeesReminderMessage(phone, school_name, father_name, pending_amount, student_name, class_name, last_date);
};

module.exports = {
    otpWhatsappMessage,
    feesConfirmationMessage,
    feesReminderMessage
};