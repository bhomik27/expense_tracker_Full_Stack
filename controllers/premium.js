const User = require('../models/user');
const Expense = require('../models/expense');

const sequelize = require('../util/database');

const getLeaderboard = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name']
        });

        const expenses = await Expense.findAll({
            attributes: ['userId', [sequelize.fn('sum', sequelize.col('amount')), 'TotalExpense']],
            group: ['userId']
        });

        const userTotalExpense = {};

        expenses.forEach((expense) => {
            userTotalExpense[expense.userId] = expense.dataValues.TotalExpense;
        });

        const userLeaderboardDetails = users.map((user) => ({
            name: user.name,
            totalexpense: userTotalExpense[user.id] || 0
        }));

        // Sort the userLeaderboardDetails array by totalexpense in descending order
        userLeaderboardDetails.sort((a, b) => b.totalexpense - a.totalexpense);

        console.log(userLeaderboardDetails);
        res.status(200).json(userLeaderboardDetails);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};

module.exports = { getLeaderboard };
