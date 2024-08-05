const Razorpay = require('razorpay');
const Order = require('../models/order');
const  sequelize = require('../util/database');

const purchasepremium = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const amount = 3000;

        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                await t.rollback();
                console.error(err);
                await req.user.createOrder({ orderid: null, status: 'FAILED' }, { transaction: t });
                return res.status(500).json({ message: 'Transaction creation failed', error: err });
            }

            await req.user.createOrder({ orderid: order._id, status: 'PENDING' }, { transaction: t });
            
            await t.commit();

            return res.status(200).json({ order, key_id: rzp.key_id });
        });
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(403).json({ message: 'Something went wrong', error: error });
    }
};

const updateTransactionStatus = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { payment_id, order_id } = req.body;
        const order = await Order.findOne({ where: { orderid: order_id }, transaction: t });

        const promise1 = await order.update({ paymentid: payment_id, status: 'SUCCESSFUL' }, { transaction: t });
        const promise2 = await req.user.update({ ispremiumuser: true }, { transaction: t });

        await Promise.all([promise1, promise2]);

        await t.commit();

        return res.status(202).json({ success: true, message: 'Transaction Successful' });
    } catch (error) {
        await t.rollback();
        
        // Handle the error and update the order status to 'FAILED'
        await order.update({ paymentid: payment_id, status: 'FAILED' }, { transaction: t });
        
        console.error(error);
        return res.status(403).json({ error: error, message: 'Something went wrong' });
    }
};

module.exports = {
    purchasepremium,
    updateTransactionStatus
};
