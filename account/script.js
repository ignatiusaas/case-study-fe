document.addEventListener("DOMContentLoaded", () => {
  const signInForm = document.getElementById("sign-in-form");
  if (signInForm) {
    signInForm.addEventListener("submit", signIn);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const modalElement = document.getElementById("registerModal");
  if (modalElement) {
    const registerModal = new bootstrap.Modal(modalElement);
  }
});

function signIn(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const apiUrl = "http://localhost:8081/hr-db-api/app/sign-in";
  const signInMessage = document.getElementById("sign-in-message");

  signInMessage.textContent = "Signing in...";

  axios
    .get(apiUrl, {
      auth: {
        username: username,
        password: password,
      },
    })
    .then(function (response) {
      // Check if the JWT token is present in the header
      const token = response.headers["authorization"];
      if (token) {
        localStorage.setItem("jwtToken", token);
        console.log("JWT token stored in localStorage:", token);
        // Redirect to another page or refresh to indicate sign-in
        location.href = "../index.html";
      } else {
        signInMessage.textContent = "Invalid credentials. Please try again.";
        console.warn("No token received in response.");
      }
    })
    .catch(function (error) {
      console.error("Error during sign-in:", error);
      signInMessage.textContent = "Sign-in failed.";
    });
}

// Utility function for making authenticated requests
function authenticatedRequest(method, url, data = null) {
  const token = localStorage.getItem("jwtToken");

  // Check if token exists
  if (!token) {
    console.warn("Redirecting to login...");
    window.location.href = "../account/index.html"; // Redirect to login if token is missing
    return;
  }

  // Set up headers with the Authorization token
  const headers = {
    Authorization: `Bearer ${token}`, // Prefix token with "Bearer "
  };

  // Make the authenticated request
  return axios({
    method: method,
    url: url,
    headers: headers,
    data: data,
  })
    .then(function (response) {
      console.log("Authenticated request successful: ", response);
      return response;
    })
    .catch(function (error) {
      // Check for 401 Unauthorized error
      if (error.response && error.response.status === 401) {
        console.warn("Unauthorized. Redirecting to login...");
        localStorage.removeItem("jwtToken"); // Clear invalid token
        window.location.href = "../account/index.html"; // Redirect to login
      } else {
        console.error("Error in authenticated request:", error);
        throw error; // Rethrow error if it's not a 401
      }
    });
}

function checkLoggedInUser() {
  authenticatedRequest(
    "GET",
    "http://localhost:8081/hr-db-api/app/logged-in/user"
  )
    .then((response) => {
      const userData = response.data;
      console.log("Logged-in user data:", userData);
      // Optionally display user info or handle any redirection
    })
    .catch((error) => {
      console.error("Error fetching logged-in user:", error);
      // Optionally handle errors, e.g., redirect to login if unauthorized
    });
}

// Handle register form submission
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");

  // Only add the event listener if the register form exists on the page
  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent default form submission

      const username = document.getElementById("register-username").value;
      const password = document.getElementById("register-password").value;
      const role = "USER"; // Fixed role for all new users

      // Prepare request data
      const requestData = {
        username: username,
        password: password,
        role: role,
      };

      // Define API endpoint
      const apiUrl = "http://localhost:8081/hr-db-api/app/sign-up";

      // Send POST request with user data
      axios
        .post(apiUrl, requestData)
        .then((response) => {
          alert("Registration successful!");
          document.getElementById("register-form").reset(); // Clear form

          // Hide modal if bootstrap modal instance is available
          const registerModal = bootstrap.Modal.getInstance(
            document.getElementById("registerModal")
          );
          if (registerModal) registerModal.hide();
        })
        .catch((error) => {
          console.error("Error during registration:", error);
          document.getElementById("register-message").textContent =
            "Registration failed. Please try again.";
        });
    });
  }
});
