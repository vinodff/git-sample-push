document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Username:', username);
    console.log('Password:', password);

    // Here you would typically send the username and password to a server for authentication
    alert('Login functionality is not implemented yet. Check the console for the entered credentials.');
});
