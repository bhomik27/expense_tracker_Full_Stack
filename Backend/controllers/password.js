const ForgotPassword = require('../models/ForgotPasswordRequests');
const User = require('../models/user');
const uuidv4 = require('uuid').v4;
const bcrypt = require('bcryptjs');

const sendResetPasswordEmail = async (useremail, requestId) => {
    const Sib = require('sib-api-v3-sdk');
    const Client = Sib.ApiClient.instance;
    const apiKey = Client.authentications['api-key'];
    apiKey.apiKey = process.env.SIB_API_KEY;

    const transEmailApi = new Sib.TransactionalEmailsApi();

    const sender = {
        email: process.env.SIB_SENDER
    };

    const receivers = [
        {
            email: useremail
        },
    ];

    await transEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        subject: 'Your reset password',
        htmlContent: `your reset password has been sent to you <a href="http://localhost:3000/password/resetpassword/${requestId}">Reset Password</a> `
    });
};

const forgotpassword = async (req, res) => {
    try {
        const useremail = req.body.email;
        const user = await User.findOne({ where: { email: useremail } });

        if (!user) {
            return res.status(404).json({ error: 'User not found', success: false });
        }

        const requestId = uuidv4();
        const forgotpassword = await ForgotPassword.create({ id: requestId, userId: user.id, isactive: true });

        const resetPasswordLink = `http://localhost:3000/password/resetpassword/${requestId}`;
        await sendResetPasswordEmail(useremail, requestId);

        res.status(200).json({ message: 'Reset password email sent successfully', resetPasswordLink, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error', success: false });
    }
};

const resetpassword = async (req, res) => {
    try {
        const id = req.params.id;
        const forgotpasswordrequest = await ForgotPassword.findOne({
            where: { id, isactive: true }
        });

        if (forgotpasswordrequest) {
            res.status(200).send(`
                <html>
                    <form action="/password/updatepassword/${id}" method="post">
                        <label for="newpassword">Enter New password</label>
                        <input name="newpassword" type="password" required></input>
                        <button type="submit">Reset Password</button>
                    </form>
                </html>
            `);
        } else {
            res.status(404).json({ error: 'Invalid reset link or link has expired [resetpassword]', success: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', success: false });
    }
};

const updatepassword = async (req, res) => {
    try {
        const { newpassword } = req.body;
        const { resetpasswordid } = req.params;

        const resetpasswordrequest = await ForgotPassword.findOne({
            where: { id: resetpasswordid, isactive: true }
        });

        if (resetpasswordrequest) {
            const user = await User.findOne({ where: { id: resetpasswordrequest.userId } });

            if (user) {
                const saltRounds = 10;
                const hash = await bcrypt.hash(newpassword, saltRounds);

                await user.update({ password: hash });
                await resetpasswordrequest.update({ isactive: false });

                return res.status(201).json({ message: 'Successfully updated the new password', success: true });
            } else {
                return res.status(404).json({ error: 'No user exists', success: false });
            }
        } else {
            return res.status(404).json({ error: 'Invalid reset link or link has expired[updatepassword]', success: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error', success: false });
    }
};

module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword
};
