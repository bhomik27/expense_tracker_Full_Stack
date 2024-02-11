
document.addEventListener('DOMContentLoaded', function () {
    // Function to handle download action
    function downloadExpense() {
        console.log('Download button clicked');

        const token = localStorage.getItem('token');

        axios.get('http://localhost:3000/user/download', { headers: { "Authorization": token } })
            .then((response) => {
                if (response.status === 200) {
                    // The backend is essentially sending a download file
                    // which if we open in the browser file would download
                    var a = document.createElement("a");
                    a.href = response.data.fileURl;
                    console.log(response.data.fileURl);
                    a.download = 'myexpense.csv';
                    a.click();
                } else {
                    throw new Error(response.data.message);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

// Function to fill the tables with expense data
function fillExpenseTables(expenseData) {
    // Monthly Report Table
    const monthlyTable = document.querySelector('.monthly-table');

    // Clear existing rows
    monthlyTable.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Expense</th>
        </tr>
    `;

    // Yearly Report Table
    const yearlyTable = document.querySelector('.yearly-table');

    // Clear existing rows
    yearlyTable.innerHTML = `
        <tr>
            <th>Month</th>
            <th>Total Expense</th>
        </tr>
    `;

    // Populate monthly table
    expenseData.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.createdAt}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>${expense.amount}</td>
        `;
        monthlyTable.appendChild(row);
    });

    // Group expenses by month for yearly report
    const yearlyExpenses = {};
    expenseData.forEach(expense => {
        const month = new Date(expense.createdAt).getMonth() + 1;
        if (!yearlyExpenses[month]) {
            yearlyExpenses[month] = 0;
        }
        yearlyExpenses[month] += expense.amount;
    });

    // Populate yearly table
    Object.entries(yearlyExpenses).forEach(([month, totalExpense]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${month}</td>
            <td>${totalExpense}</td>
        `;
        yearlyTable.appendChild(row);
    });
}

    

    // Function to fetch expense data and fill tables
    function fetchExpenseData() {
        const token = localStorage.getItem('token');

        axios.get('http://localhost:3000/expense/expenses', { headers: { "Authorization": token } })
            .then((response) => {
                if (response.status === 200) {
                    const expenseData = response.data;
                    fillExpenseTables(expenseData);
                } else {
                    throw new Error(response.data.message);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

//     function previousDownloads() {
//     const token = localStorage.getItem('token');
    
//     console.log("Prev Dwnld Button clicked");
    
//     axios.get('http://localhost:3000/user/getallfiles', { headers: { "Authorization": token } })
//         .then(response => {
//             console.log(response.data);
//         })
//         .catch(error => {
//             console.error(error);
//         });
// }


    
    

    
    
function previousDownloads() {
    const token = localStorage.getItem('token');

    console.log("Prev Dwnld Button clicked");

    axios.get('http://localhost:3000/user/getallfiles', { headers: { "Authorization": token } })
        .then(response => {
            console.log(response.data);

            const files = response.data;

            // Create a table element
            const table = document.createElement('table');
            table.classList.add('previous-downloads-table');

            // Create table header row with desired headings
            const headerRow = table.insertRow();
            const fileURLHeader = document.createElement('th');
            fileURLHeader.textContent = 'File-URL';
            headerRow.appendChild(fileURLHeader);
            const dateHeader = document.createElement('th');
            dateHeader.textContent = 'Date';
            headerRow.appendChild(dateHeader);

            // Fill table with data
            files.forEach(file => {
                const row = table.insertRow();
                // Create a hyperlink for the file URL
                const fileURLCell = row.insertCell();
                const fileURLLink = document.createElement('a');
                fileURLLink.href = file.fileUrl; // Assuming the key is fileUrl, update if different
                fileURLLink.textContent = file.fileUrl;
                fileURLCell.appendChild(fileURLLink);
                fileURLCell.style.backgroundColor =  'white';
                // Add date cell
                const dateCell = row.insertCell();
                dateCell.textContent = file.createdAt;
            });

            // Add table to the document body
            document.body.appendChild(table);
        })
        .catch(error => {
            console.error(error);
        });
}



    document.getElementById('download').addEventListener('click', downloadExpense);
    document.getElementById('previousDownlaods').addEventListener('click', previousDownloads);


    // Fetch and fill expense data on page load
    fetchExpenseData();
});
