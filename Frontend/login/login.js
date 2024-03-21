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



    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('loginForm');
        form.addEventListener('submit', login);

        async function login(event) {
            event.preventDefault();

            try {
                let email = document.getElementById('email').value;
                let password = document.getElementById('password').value;

                let loginData = {
                    email,
                    password
                };

                const response = await axios.post("http://16.170.11.119:3000/user/login", loginData);

                console.log(response.data); // Logging response data

                // Clear input fields after successful login
                document.getElementById('email').value = '';
                document.getElementById('password').value = '';

                // Show success message
                const successMessage = document.getElementById('successMessage');
                successMessage.textContent = response.data.message;           

                alert("uer login successfull");
                
                localStorage.setItem('token', response.data.token);

                // Redirect to expense.html after successful login
                window.location.href = '../expense/expense.html';


            } catch (error) {
                if (error.response && error.response.status === 401) {
                    // If the status code is 401 (Unauthorized), show the message on the screen
                    const errorMessage = document.getElementById('errorMessage');
                    errorMessage.textContent = error.response.data.message; // Displaying the error message
                } else if (error.response && error.response.status === 404) {
                    const errorMessage = document.getElementById('errorMessage');
                    errorMessage.textContent = error.response.data.message;
                } else {
                    console.error(error); // Log other errors to the console
                }
            }
        }
    });
