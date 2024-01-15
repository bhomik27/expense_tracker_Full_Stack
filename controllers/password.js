// Load environment variables from .env file
require('dotenv').config();

exports.getresetPassword = async (req, res) => {
    const useremail = req.body.email;
    var Sib = require('sib-api-v3-sdk');
    var Client = Sib.ApiClient.instance;
    
    var apiKey = Client.authentications['api-key'];
    apiKey.apiKey = process.env.SIB_API_KEY; // Use the environment variable

    const transEmailApi = new Sib.TransactionalEmailsApi();

    const sender = {
        email: 'bhomikmaheshwari27@gmail.com'
    }

    const receivers = [
        {
            email: useremail
        },
    ]

    transEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        subject: 'Your reset password',
        textContent: 'your reset password has been sent to you'
    })
        .then(console.log)
        .catch(console.log)
}
