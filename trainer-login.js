document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting via the browser

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Username:', username, 'Password:', password);

    // Here you would typically validate the credentials and redirect the user
    // For now, just simulate redirection
    window.location.href = 'trainer-page.html'; // Redirect to trainer page after login
});
