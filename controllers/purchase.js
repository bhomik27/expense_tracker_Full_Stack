const Razorpay = require('razorpay')
const Order = require('../models/order')

const purchasepremium = async (req, res) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const amount = 3000

        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                // Handle the error and update the order status to 'FAILED'
                console.error(err);
                await req.user.createOrder({ orderid: null, status: 'FAILED' });
                return res.status(500).json({ message: 'Transaction creation failed', error: err });
            }

            req.user.createOrder({ orderid: order.id, status: 'PENDING' }).then(() => {
                return res.status(200).json({ order, key_id: rzp.key_id })
            })
                .catch(err => {
                    console.error(err);
                    return res.status(500).json({ message: 'Order creation failed', error: err });
                });
        })
    } catch (error) {
        console.log(error);
        res.status(403).json({ message: 'Something went wrong', error: error });
    }
}

const updateTransactionStatus = async (req, res) => {    
    try {
        const { payment_id, order_id } = req.body;
        const order = await Order.findOne({ where: { orderid: order_id } });

        const promise1 = await order.update({ paymentid: payment_id, status: 'SUCCESSFUL' });
        const promise2 = await req.user.update({ ispremiumuser: true });

        Promise.all([promise1, promise2]).then(() => {
            return res.status(202).json({ success: true, message: 'Transaction Successful' });
        }).catch((err) => {
            throw new Error(err);
        })

    } catch  (error) {
        // Handle the error and update the order status to 'FAILED'
        await order.update({ paymentid: payment_id, status: 'FAILED' });
        console.error(error);
        return res.status(403).json({ error: error, message: 'Something went wrong' });
    }
};


module.exports = {
    purchasepremium,
    updateTransactionStatus
}




