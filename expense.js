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

        console.log(amount);
        console.log(description);
        console.log(category);

        const response = await axios.post("http://localhost:3000/expense/add-expense", userExpense);

        printUserExpense(response.data);

        // Clear input fields after successful submission
        event.target.elements.amount.value = '';
        event.target.elements.description.value = '';
        event.target.elements.category.value = '';

        console.log(response);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// get all expenses and show them on ui
window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await axios.get("http://localhost:3000/expense/expenses");
        console.log(response);

        for (var i = 0; i < response.data.length; i++) {
            printUserExpense(response.data[i]);
        }
    } catch (error) {
        console.log('Error:', error.message);
    }
});

function printUserExpense(userExpense) {
    const parentElement = document.getElementById('expense');
    const childElement = document.createElement('li');

    childElement.innerHTML = `Amount: ${userExpense.amount} <br> Description: ${userExpense.description} <br> Category: ${userExpense.category} <br>`;

    const deleteButton = document.createElement('input');
    deleteButton.type = 'button';
    deleteButton.value = 'Delete';
    deleteButton.style.fontWeight = 'bold';
    deleteButton.style.backgroundColor = 'red';
    deleteButton.onclick = async () => {
        try {
            await axios.delete(`http://localhost:3000/expense/delete-expense/${userExpense.id}`);
            parentElement.removeChild(childElement);
        } catch (error) {
            console.error('Error deleting expense:', error.message);
        }
    };

    const editButton = document.createElement('input');
    editButton.type = 'button';
    editButton.value = 'Edit';
    editButton.style.fontWeight = 'bold';
    editButton.style.backgroundColor = 'green';

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
