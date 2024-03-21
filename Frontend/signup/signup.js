document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('signupForm');
    form.addEventListener('submit', signup);

    async function signup(event) {
        event.preventDefault();

        try {
            let name = document.getElementById('name').value;
            let email = document.getElementById('email').value;
            let password = document.getElementById('password').value;

            let signupData = {
                name,
                email,
                password
            };

            const response = await axios.post("http://16.170.11.119:3000/user/signup", signupData);

            console.log(response.data); // Logging response data

            // Clear input fields after successful signup
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';

            // Show success message
            const successMessage = document.getElementById('successMessage');
            successMessage.textContent = response.data.message;

            // Optionally, redirect the user to another page after successful signup
            // window.location.href = '/success'; // Redirect to success page

        } catch (error) {
            if (error.response.status === 409) {
                // If the status code is 409 (User already exists), show the message on the screen
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.textContent = error.response.data.message; // Displaying the error message
            } else {
                console.error(error.response.data); // Log other errors to the console
            }
        }
    }
});
