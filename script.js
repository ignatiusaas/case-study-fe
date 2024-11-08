document.addEventListener("DOMContentLoaded", () => {
  checkLoggedInUser(); // Run when page loads
});

// Check if JWT token exists in localStorage
const token = localStorage.getItem("jwtToken");

// If token is not found, redirect to the login page
if (!token) {
  window.location.href = "account/index.html";
}

// Logout function
document.getElementById("logout-btn").addEventListener("click", function () {
  // Clear the JWT token from localStorage
  localStorage.removeItem("jwtToken");

  // Redirect to root index.html
  window.location.href = "account/index.html";
});
