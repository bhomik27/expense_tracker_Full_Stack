const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = { status: 200, data: { message: 'Login successful!' } };
        
        if (response.status === 200) {
            console.log(response.data.message);
        } else {
            errorMessage.textContent = 'Login failed. Please check your credentials.';
        }
    } catch (error) {
        console.error('Error during login:', error);
        errorMessage.textContent = 'Internal server error. Please try again later.';
    }
});
