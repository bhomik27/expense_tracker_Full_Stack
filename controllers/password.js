
exports.getresetPassword = async (req, res) => {
    const useremail=req.body.email
    var Sib = require('sib-api-v3-sdk');
    var Client = Sib.ApiClient.instance;
    
    var apiKey = Client.authentications['api-key'];
    apiKey.apiKey = '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';

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