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

            const response = await axios.post("http://localhost:3000/user/login", loginData);

            console.log(response.data); // Logging response data

            // Clear input fields after successful login
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';


            // Show success message
            const successMessage = document.getElementById('successMessage');
            successMessage.textContent = response.data.message;

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
