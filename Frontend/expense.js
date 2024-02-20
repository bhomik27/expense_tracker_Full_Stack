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

    // const token = localStorage.getItem('token');
    // try {
    //     const response = await axios.get("http://localhost:3000/expense/expenses", { headers: { "Authorization": token } });
    //     console.log(response);

    //     for (var i = 0; i < response.data.length; i++) {
    //         printUserExpense(response.data[i]);
    //     }
    // } catch (error) {
    //     console.log('Error:', error.message);
    //     showMessage('Error getting expense. Please try again.', false);

    // }
    await checkPremiumStatus();
    
    const report_btn = document.createElement('button');
    report_btn.appendChild(document.createTextNode('Show Report'));
    report_btn.setAttribute('id', 'report');
    document.getElementById('premiumStatus').appendChild(report_btn);

    report_btn.onclick = async function () {
        window.location.href = 'report.html';
    };
    await fetchExpenses(currentPage, limit);

});


//function to show expenses on UI
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
    deleteButton.onclick = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/expense/delete-expense/${userExpense.id}`, { headers: { "Authorization": token } });
            childElement.classList.add('slide-out'); // Add class for sliding out
            // Delay removal to allow transition to complete
            setTimeout(() => {
                parentElement.removeChild(childElement);
            }, 300);
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
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/expense/edit-expense/${userExpense.id}`, updatedUserExpenseData, { headers: { "Authorization": token } });
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

    // Trigger animation by adding a class
    childElement.classList.add('animate');
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
            // premiumStatusDiv.textContent = 'You are a Premium User';
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

// Function to show the leaderboard
let isLeaderboardVisible = false; // Add this variable to keep track of leaderboard visibility

async function showLeaderboard() {
    // Check if the leaderboard is already visible
    if (isLeaderboardVisible) {
        console.log('Leaderboard is already visible.');
        return;
    }

    // Hide the expense container, form, ul, and li items
    const expenseContainer = document.getElementById('expense');
    const expenseForm = document.getElementById('my-form');
    const leaderboardContainer = document.getElementById('leaderboard');

    expenseContainer.style.display = 'none';
    expenseForm.style.display = 'none';
    leaderboardContainer.style.display = 'block';

     // Hide pagination controls
    document.getElementById('paginationControls').style.display = 'none';
    document.getElementById('perPageDropdown').style.display = 'none';

    //change the background-color of the body to white
    document.body.style.backgroundColor = 'lightgrey';
    

    const token = localStorage.getItem('token');
    try {
        const leaderboardArray = await axios.get('http://localhost:3000/premium/showleaderboard', { headers: { "Authorization": token } });
        console.log(leaderboardArray);

        // Clear the leaderboard container
        leaderboardContainer.innerHTML = '';

        // Create and append the leaderboard table
        leaderboardContainer.appendChild(createLeaderboardTable(leaderboardArray.data));

        // Set the flag to true to indicate that the leaderboard is now visible
        isLeaderboardVisible = true;
    } catch (error) {
        console.error(error);
        alert('Error fetching and displaying leaderboard');
        showMessage('Error fetching and displaying leaderboard', false);
    }
}

// Function to create the leaderboard table
function createLeaderboardTable(leaderboardData) {
    const table = document.createElement('table');
    table.id = 'leaderboard-table';

    // Create the table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Name', 'Total Expense'];

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement('tbody');

    leaderboardData.forEach(userData => {
        const row = document.createElement('tr');
        const columns = [userData.name, userData.totalExpenses]; 

        columns.forEach(columnText => {
            const td = document.createElement('td');
            td.textContent = columnText;
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    return table;
}






// Define global variables for pagination
let currentPage = 1;
const limit = 10; // Number of expenses per page
let totalPages = 0;

// Define a global variable to store the number of expenses per page
let expensesPerPage = localStorage.getItem('expensesPerPage') || 10;

// Function to fetch expenses with pagination

async function fetchExpenses(page, limit) {
    try {
        // Update the limit to use the user's preference
        const limit = parseInt(expensesPerPage);


        const token = localStorage.getItem('token');

        // Fetch expenses with the updated limit
        const response = await axios.get(`http://localhost:3000/expense/expenses?page=${page}&limit=${limit}`, {
            headers: { "Authorization": token }
        });

        console.log(response);

        // Clear the expense list before adding new items
        const expenseList = document.getElementById('expense');
        expenseList.innerHTML = '';

        for (var i = 0; i < response.data.expenses.length; i++) {
            printUserExpense(response.data.expenses[i]);
        }

        // Update total pages based on response
        totalPages = response.data.totalPages;

        // Update pagination UI based on total pages
        updatePaginationUI(currentPage, totalPages);
    } catch (error) {
        console.log('Error:', error.message);
        showMessage('Error getting expenses. Please try again.', false);
    }
}




// Function to update pagination UI
function updatePaginationUI(currentPage, totalPages) {
    const prevPageButton = document.getElementById('prevPageButton');
    const nextPageButton = document.getElementById('nextPageButton');
    const pageNumberInput = document.getElementById('pageNumberInput');

    // Enable or disable Previous Page Button based on current page
    prevPageButton.disabled = currentPage === 1;

    // Enable or disable Next Page Button based on current page and total pages
    nextPageButton.disabled = currentPage === totalPages || totalPages === 0;

    // Update the page number input field
    pageNumberInput.value = currentPage;
}

// Event listener for pagination controls
document.getElementById('nextPageButton').addEventListener('click', async () => {
    if (currentPage < totalPages) {
        currentPage++; // Increment current page
        await fetchExpenses(currentPage, limit);
    }
});

document.getElementById('prevPageButton').addEventListener('click', async () => {
    if (currentPage > 1) {
        currentPage--; // Decrement current page
        await fetchExpenses(currentPage, limit);
    }
});

document.getElementById('pageNumberButton').addEventListener('click', async () => {
    const selectedPage = parseInt(document.getElementById('pageNumberInput').value);
    if (selectedPage >= 1 && selectedPage <= totalPages) {
        currentPage = selectedPage;
        await fetchExpenses(currentPage, limit);
    }
});
