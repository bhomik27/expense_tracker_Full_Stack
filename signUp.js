async function signUp(event) {
    event.preventDefault(); // Corrected case

    try {
        let name = document.getElementById('name').value;
        let email = document.getElementById('email').value;
        let password = document.getElementById('password').value;

        let SignupData = {
            name,
            email,
            password
        };

        const response = await axios.post("http://localhost:3000/user/signup", SignupData);
        console.log(response);
    }
    catch(error) {
        console.log(error);
    }
}

// Attaching signUp function to form submission event
const form = document.querySelector('form'); // Assuming there's only one form in the document
form.addEventListener('submit', signUp);
