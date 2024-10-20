// static/js/login.js

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login-form").addEventListener("submit", (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: username, password: password })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = "/employee";
                } else {
                    alert("Login failed: " + data.message);
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    });
});
