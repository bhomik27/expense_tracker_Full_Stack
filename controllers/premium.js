const User = require('../models/user');

exports.getLeaderboard = async (req, res, next) => {
    try {
        const leaderboard = await User.findAll({
            order: [['totalExpenses', 'DESC']],
            attributes: ['name', 'totalExpenses']
        });

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
