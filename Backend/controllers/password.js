const ForgotPassword = require('../models/ForgotPasswordRequests');
const User = require('../models/user');
const uuidv4 = require('uuid').v4;
const bcrypt = require('bcryptjs');
const Sib = require('sib-api-v3-sdk');


const sendResetPasswordEmail = async (useremail, requestId) => {
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
            <head>
                <title>Reset Password</title>
                <style>
                    /* Add your CSS styles here */
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        line-height: 1.6;
                        background-color: #2c3e50;
                    }
                    
                    .card {
                        margin: auto;
                        margin-top: 10px;
                        width: 400px;
                        max-width: 90%; /* Changed for responsiveness */
                        background: grey;
                        border-radius: 10px;
                        padding: 20px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    
                    .form-group {
                        margin-bottom: 20px;
                    }
                    
                    label {
                        font-weight: bold;
                    }
                    
                    input[type="password"] {
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                    }
                    
                    button[type="submit"] {
                        display: block;
                        width: 100%;
                        padding: 10px 15px;
                        border: 0;
                        background: #3498db;
                        color: #fff;
                        border-radius: 15px;
                        cursor: pointer;
                        transition: background 0.3s ease;
                    }
                    
                    button[type="submit"]:hover {
                        background: #2980b9;
                    }
                    
                    /* Media Queries for responsiveness */
                    @media only screen and (max-width: 768px) {
                        .card {
                            max-width: 350px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="card">
                        <div class="card-body">
                            <form action="/password/updatepassword/${id}" method="post" class="reset-password-form">
                                <h2>Reset Your Password</h2>
                                <div class="form-group">    
                                    <label for="newpassword">Enter New Password</label>
                                    <input name="newpassword" type="password" required>
                                </div>
                                <button type="submit">Reset Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            </body>
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
