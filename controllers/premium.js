const User = require('../models/user');
const Expense = require('../models/expense');

const sequelize = require('../util/database');

const getLeaderboard = async (req, res) => {
    try {
        const users = await User.findAll();
        const expenses = await Expense.findAll();
        const userTotalExpense = {};

        expenses.forEach((expense) => {
            if (userTotalExpense[expense.userId]) {
                userTotalExpense[expense.userId] += expense.amount;
            } else {
                userTotalExpense[expense.userId] = expense.amount;
            }
        });

        var userLeaderboardDetails = [];
        users.forEach((user) => {
            userLeaderboardDetails.push({ name: user.name, totalexpense: userTotalExpense[user.id] || 0 });
        });

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
