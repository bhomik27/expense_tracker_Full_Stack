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
    const form = document.querySelector('form');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission behavior

        // Get the email input value    
        const email = document.getElementById('email').value;

        // Make an Axios POST request to the backend API
        axios.post('http://localhost:3000/password/forgotpassword', {
            email: email
        })
            .then(function (response) {
                // Handle the successful response from the server
                console.log('Password reset email sent successfully');
                showMessage('Password reset email sent successfully');
                // You can add more logic here based on your requirements
            })
            .catch(function (error) {
                // Handle errors from the server
                console.error('Error sending password reset email', error);
                // You can add more error handling logic here
            });
    });
});






function formsubmitted(e){
    e.preventDefault();
    console.log('called');
}