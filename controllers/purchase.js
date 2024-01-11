const Razorpay = require('razorpay')
const Order = require('../models/order')

const purchasepremium = async (req, res) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const amount = 3000

        rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err))
            }
            req.user.createOrder({ orderid: order.id, status: 'PENDING' }).then(() => {
                return res.status(200).json({ order, key_id: rzp.key_id })
            })
                .catch(err => {
                    throw new Error(err)
                })
        })
    } catch (error) {
        console.log(error)
        res.status(403).json({ message: 'Something went wrong', error: error })
    }
}

const updateTransactionStatus = async (req, res) => {
    try {
        const { payment_id, order_id } = req.body;
        const order = await Order.findOne({ where: { orderid: order_id } });

        await order.update({ paymentid: payment_id, status: 'SUCCESSFUL' });

        await req.user.update({ ispremiumuser: true });

        return res.status(202).json({ success: true, message: 'Transaction Successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


module.exports = {
    purchasepremium,
    updateTransactionStatus
}