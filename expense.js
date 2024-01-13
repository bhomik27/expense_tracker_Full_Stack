//helper function to show success or error message on screen
function showMessage(message, isSuccess) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.padding = '10px';
    messageDiv.style.marginTop = '10px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.color = isSuccess ? 'green' : 'red';
    messageDiv.style.backgroundColor = isSuccess ? 'lightgreen' : 'lightcoral';
    messageDiv.style.position = 'fixed';
    messageDiv.style.bottom = '10px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.fontSize = '16px';

    document.body.appendChild(messageDiv);

    // Remove the message after 5 seconds
    setTimeout(() => {
        document.body.removeChild(messageDiv);
    }, 5000);
}




// Function to handle form submission
async function addExpense(event) {
    try {
        event.preventDefault();

        const amount = event.target.elements.amount.value;
        const description = event.target.elements.description.value;
        const category = event.target.elements.category.value;

        let userExpense = {
            amount,
            description,
            category
        };

        console.log(userExpense);

        const token = localStorage.getItem('token');

        const response = await axios.post("http://localhost:3000/expense/add-expense", userExpense, { headers: { "Authorization": token } });

        printUserExpense(response.data);
        showMessage('Expense added successfully!', true);
        // Clear input fields after successful submission
        event.target.elements.amount.value = '';
        event.target.elements.description.value = '';
        event.target.elements.category.value = '';

        console.log(response);
    } catch (error) {
        console.error('Error:', error.message);
        showMessage('Error adding expense. Please try again.', false);

    }
}

// get all expenses and show them on ui
window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get("http://localhost:3000/expense/expenses", { headers: { "Authorization": token } });
        console.log(response);

        for (var i = 0; i < response.data.length; i++) {
            printUserExpense(response.data[i]);
        }
    } catch (error) {
        console.log('Error:', error.message);
        showMessage('Error getting expense. Please try again.', false);

    }
    await checkPremiumStatus();
});

function printUserExpense(userExpense) {
    const parentElement = document.getElementById('expense');
    const childElement = document.createElement('li');

    childElement.innerHTML = `Amount: ${userExpense.amount} <br> Description: ${userExpense.description} <br> Category: ${userExpense.category} <br>`;

    const deleteButton = document.createElement('input');
    deleteButton.type = 'button';
    deleteButton.value = 'Delete';
    deleteButton.id = 'Delete';
    deleteButton.style.fontWeight = 'bold';
    deleteButton.style.backgroundColor = 'red';
    deleteButton.style.margin = '10px';
    deleteButton.style.border
    deleteButton.onclick = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/expense/delete-expense/${userExpense.id}`, { headers: { "Authorization": token } });
            parentElement.removeChild(childElement);
            showMessage('Expense Deleted successfully!', true);
        } catch (error) {
            console.error('Error deleting expense:', error.message);
        }
    };

    const editButton = document.createElement('input');
    editButton.type = 'button';
    editButton.value = 'Edit';
    editButton.id = 'Edit';
    editButton.style.fontWeight = 'bold';
    editButton.style.backgroundColor = 'green';
    editButton.style.margin = '10px';

    editButton.onclick = async () => {
        const updatedAmount = prompt("Enter updated amount:", userExpense.amount);
        const updatedDescription = prompt("Enter updated description:", userExpense.description);
        const updatedCategory = prompt("Enter updated category:", userExpense.category);

        const updatedUserExpenseData = {
            amount: updatedAmount || userExpense.amount,
            description: updatedDescription || userExpense.description,
            category: updatedCategory || userExpense.category
        };

        try {
            await axios.put(`http://localhost:3000/expense/edit-expense/${userExpense.id}`, updatedUserExpenseData);
            // Update UI with updated expense details
            childElement.innerHTML = `Amount: ${updatedUserExpenseData.amount} <br> Description: ${updatedUserExpenseData.description} <br> Category: ${updatedUserExpenseData.category} <br>`;
            childElement.appendChild(deleteButton);
            childElement.appendChild(editButton);
        } catch (error) {
            console.error('Error updating expense:', error.message);
        }
    };
    parentElement.appendChild(childElement);
    childElement.appendChild(deleteButton);
    childElement.appendChild(editButton);
}

document.getElementById('premiumButton').onclick = async function (e) {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get("http://localhost:3000/purchase/premiummembership", {
            headers: { "Authorization": token }
        });
        console.log(response);

        var options = {
            "key": response.data.key_id,
            "order_id": response.data.order.id,
            "handler": async function (response) {
                try {
                    await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
                        order_id: options.order_id,
                        payment_id: response.razorpay_payment_id,
                    }, {
                        headers: { "Authorization": token }
                    });
                    await checkPremiumStatus();
                    showMessage("You are a premium user now", true);
                } catch (error) {
                    console.error(error);
                    alert('Error updating transaction status');
                    showMessage('Error updating transaction status', false);
                }
            }
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
        e.preventDefault();

        rzp1.on('payment.failed', async function (response) {
            console.log(response);
            alert('Payment failed');
            showMessage('Payment failed', false);

        });
    } catch (error) {
        console.error(error);
        alert('Error purchasing premium membership');
        showMessage('Error purchasing premium membership', false);
    }
}



//function to check premium status 
async function checkPremiumStatus() {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get("http://localhost:3000/user/premium-status", {
            headers: { "Authorization": token }
        });

        const premiumStatusDiv = document.getElementById('premiumStatus');
        if (response.data.isPremiumUser) {
            premiumStatusDiv.textContent = 'You are a Premium User';
            premiumStatusDiv.style.color = 'green';
            // Hide the premium button if the user is premium
            document.getElementById('premiumButton').style.display = 'none';


            // Create a "Show Leaderboard" button
            const leaderboardButton = document.createElement('button');
            leaderboardButton.textContent = 'Leaderboard';
            leaderboardButton.id = 'leaderboardButton'; // Set the id
            leaderboardButton.addEventListener('click', showLeaderboard);
            document.getElementById('header').appendChild(leaderboardButton);

        } else {
            // Show the premium button if the user is not premium
            document.getElementById('premiumButton').style.display = 'block';
        }
    } catch (error) {
        console.error(error);
        alert('Error checking premium status');
        showMessage('Error checking premium status', false);
    }
}


//function to show the leaderboard
async function showLeaderboard() {
    const token = localStorage.getItem('token');
    const leaderboardArray = await axios.get('http://localhost:3000/premium/showleaderboard', { headers: { "Authorization": token } });
    console.log(leaderboardArray);


    var leaderboardElem = document.getElementById('leaderboard');
    leaderboardElem.innerHTML += '<h1> Leader-Board</h1>'
    leaderboardArray.data.forEach((userDetails) => {
        leaderboardElem.innerHTML += `<li> Name - ${userDetails.name} Total Expense - ${userDetails.totalexpense}</li>`
    })
}