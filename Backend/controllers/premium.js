const User = require('../models/user');

exports.getLeaderboard = async (req, res, next) => {
    try {
        const leaderboard = await User.find({}, 'name totalExpenses') // Fetch the documents with only the specified fields
            .sort({ totalExpenses: -1 }) // Sort by totalExpenses in descending order
            .exec(); // Execute the query

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// const User = require('../models/user');

// exports.getLeaderboard = async (req, res, next) => {
//     try {
//         const leaderboard = await User.findAll({
//             order: [['totalExpenses', 'DESC']],
//             attributes: ['name', 'totalExpenses']
//         });

//         res.json(leaderboard);
//     } catch (error) {
//         console.error('Error fetching leaderboard:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };
