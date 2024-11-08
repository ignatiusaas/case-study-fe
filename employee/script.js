document.addEventListener("DOMContentLoaded", () => {
  checkLoggedInUser(); // Run when page loads
});

const today = new Date().toISOString().split("T")[0];

let currentPage = 1;
let currentSearchPage = 1;
const rowsPerPage = 5;
let employeeList = [];

document
  .getElementById("fetch-btn")
  .addEventListener("click", fetchEmployeeData);
document
  .getElementById("search-input")
  .addEventListener("input", searchEmployees);
document
  .getElementById("create-employee-form")
  .addEventListener("submit", createEmployee);
document
  .getElementById("update-employee-form")
  .addEventListener("submit", updateEmployee);

document
  .getElementById("search-btn")
  .addEventListener("click", fetchEmployeeById);

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayPage(currentPage, employeeList);
  }
});

document.getElementById("next-page").addEventListener("click", () => {
  if (currentPage * rowsPerPage < employeeList.length) {
    currentPage++;
    displayPage(currentPage, employeeList);
  }
});

function fetchEmployeeData() {
  const apiUrl = "http://localhost:8081/hr-db-api/employee/get/all";
  authenticatedRequest("GET", apiUrl)
    .then((response) => {
      employeeList = response.data.content; // Store all employees
      displayEmployees(employeeList);
    })
    .catch((error) => {
      console.error("Error fetching employee data:", error);
      document.getElementById("info-message").textContent =
        "Error loading data.";
    });
}

function displayEmployees(data) {
  currentPage = 1; // Reset to the first page
  displayPage(currentPage, data);
}

function displayPage(page, data) {
  const tableBody = document.querySelector("#employee-table tbody");
  const searchSection = document.getElementById("search-section");

  tableBody.innerHTML = ""; // Clear previous data

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);
  const paginatedEmployees = data.slice(startIndex, endIndex);

  if (searchSection) {
    searchSection.classList.remove("d-none");
  }

  paginatedEmployees.forEach((employee) => {
    if (!employee.manager_id) {
      employee.manager_id = "N/A";
    }
    if (!employee.commission_pct) {
      employee.commission_pct = "N/A";
    }
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${employee.employee_id}</td>
      <td>${employee.first_name}</td>
      <td>${employee.last_name}</td>
      <td>${employee.email}</td>
      <td>${employee.phone_number}</td>
      <td>${new Date(employee.hire_date).toLocaleDateString()}</td>
      <td>${employee.job_id}</td>
      <td>${employee.job_title}</td>
      <td>${employee.salary}</td>
      <td>${employee.commission_pct}</td>
      <td>${employee.manager_id}</td>
      <td>${employee.department_id}</td>
      <td>${employee.department_name}</td>
      <td>${employee.location_id}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editEmployee(${
          employee.employee_id
        })">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${
          employee.employee_id
        })">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  let totalPages = Math.ceil(data.length / rowsPerPage);

  document.getElementById(
    "page-info"
  ).textContent = `Page ${page} out of ${totalPages}`;
  document.getElementById("prev-page").disabled = page === 1;
  document.getElementById("next-page").disabled = endIndex >= data.length;
}

// Search employees and display matching results
function searchEmployees() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const filteredEmployees = employeeList.filter(
    (employee) =>
      employee.first_name.toLowerCase().includes(query) ||
      employee.last_name.toLowerCase().includes(query)
  );

  displayEmployees(filteredEmployees); // Display filtered employees
}

// Fetch employee by ID
function fetchEmployeeById() {
  console.log("Fetching employee by ID...");
  const employeeId = document.getElementById("employee-id").value;
  const employeeDetail = document.getElementById("employee-detail");

  if (!employeeId) {
    employeeDetail.textContent = "Please enter a valid Employee ID.";
    return;
  }

  const apiUrl = `http://localhost:8081/hr-db-api/employee/get/${employeeId}`;
  employeeDetail.textContent = "Loading employee data...";

  authenticatedRequest("GET", apiUrl)
    .then(function (response) {
      const data = response.data;
      displayEmployeeDetail(data);
    })
    .catch(function (error) {
      console.error("Error fetching employee by ID:", error);
      employeeDetail.textContent = "Error loading employee data.";
    });
}

function displayEmployeeDetail(data) {
  const employee = data.content;
  const employeeDetail = document.getElementById("employee-detail");

  if (!employee.commission_pct) {
    employee.commission_pct = "N/A";
  }

  if (!employee.manager_id) {
    employee.manager_id = "N/A";
  }

  if (!employee) {
    employeeDetail.textContent = "No employee found with the given ID.";
    return;
  }

  employeeDetail.innerHTML = `
        <h4>Employee ID: ${employee.employee_id}</h4>
        <p><strong>Name:</strong> ${employee.first_name} ${
    employee.last_name
  }</p>
        <p><strong>Email:</strong> ${employee.email}</p>
        <p><strong>Phone Number:</strong> ${employee.phone_number}</p>
        <p><strong>Hire Date:</strong> ${new Date(
          employee.hire_date
        ).toLocaleDateString()}</p>
        <p><strong>Job ID:</strong> ${employee.job_id}</p>
        <p><strong>Job Title:</strong> ${employee.job_title}</p>
        <p><strong>Salary:</strong> ${employee.salary}</p>
        <p><strong>Commission %:</strong> ${employee.commission_pct}</p>
        <p><strong>Manager ID:</strong> ${employee.manager_id}</p>
        <p><strong>Department:</strong> ${employee.department_id}</p>
        <p><strong>Department:</strong> ${employee.department_name}</p>
        <p><strong>Location ID:</strong> ${employee.location_id}</p>
    `;
}

function createEmployee(event) {
  event.preventDefault();

  document.getElementById("hire-date").setAttribute("max", today);
  const apiUrl = "http://localhost:8081/hr-db-api/employee/create";
  const createMessage = document.getElementById("create-message");

  const employeeData = {
    first_name: document.getElementById("first-name").value,
    last_name: document.getElementById("last-name").value,
    email: document.getElementById("email").value,
    phone_number: document.getElementById("phone-number").value,
    hire_date: document.getElementById("hire-date").value,
    job_id: document.getElementById("job-id").value,
    salary: parseFloat(document.getElementById("salary").value),
    commission_pct: parseFloat(document.getElementById("commission-pct").value),
    manager_id: parseInt(document.getElementById("manager-id").value),
    department_id: parseInt(document.getElementById("department-id").value),
  };

  createMessage.textContent = "Creating employee...";

  authenticatedRequest("POST", apiUrl, employeeData)
    .then(function (response) {
      createMessage.textContent = "Employee created successfully!";
      document.getElementById("create-employee-form").reset();
      fetchEmployeeData();
    })
    .catch(function (error) {
      console.error("Error creating employee:", error);
      createMessage.textContent = "Error creating employee.";
    });
}

function editEmployee(employeeId) {
  // Fetch employee details by ID and pre-fill the update form
  const employee = employeeList.find((emp) => emp.employee_id === employeeId);
  if (employee) {
    document.getElementById("update-employee-id").value = employee.employee_id;
    document.getElementById("update-first-name").value = employee.first_name;
    document.getElementById("update-last-name").value = employee.last_name;
    document.getElementById("update-email").value = employee.email;
    document.getElementById("update-phone-number").value =
      employee.phone_number;
    document.getElementById("update-hire-date").value = employee.hire_date;
    document.getElementById("update-job-id").value = employee.job_id;
    document.getElementById("update-salary").value = employee.salary;
    document.getElementById("update-commission-pct").value =
      employee.commission_pct;
    document.getElementById("update-manager-id").value = employee.manager_id;
    document.getElementById("update-department-id").value =
      employee.department_id;

    // Scroll to or show update form if needed
    document.getElementById("update-employee-form").scrollIntoView();
  } else {
    console.warn(`Employee with ID ${employeeId} not found.`);
  }
}

function deleteEmployee(employeeId) {
  const apiUrl = `http://localhost:8081/hr-db-api/employee/delete/${employeeId}`;
  var confirmDelete = confirm("Are you sure you want to delete this employee?");
  if (!confirmDelete) {
    return;
  }

  authenticatedRequest("DELETE", apiUrl)
    .then(function () {
      fetchEmployeeData();
    })
    .catch(function (error) {
      console.error("Error deleting employee:", error);
      deleteMessage.textContent = "Error deleting employee.";
    });
}

// Update an existing employee
function updateEmployee(event) {
  event.preventDefault();

  const employeeId = document.getElementById("update-employee-id").value;
  const apiUrl = `http://localhost:8081/hr-db-api/employee/update/${employeeId}`;
  const updateMessage = document.getElementById("update-message");

  document.getElementById("update-hire-date").setAttribute("max", today);

  const employeeData = {
    employee_id: employeeId,
    first_name: document.getElementById("update-first-name").value,
    last_name: document.getElementById("update-last-name").value,
    email: document.getElementById("update-email").value,
    phone_number: document.getElementById("update-phone-number").value,
    hire_date: document.getElementById("update-hire-date").value,
    job_id: document.getElementById("update-job-id").value,
    salary: parseFloat(document.getElementById("update-salary").value),
    commission_pct: parseFloat(
      document.getElementById("update-commission-pct").value
    ),
    manager_id: parseInt(document.getElementById("update-manager-id").value),
    department_id: parseInt(
      document.getElementById("update-department-id").value
    ),
  };

  updateMessage.textContent = "Updating employee data...";

  authenticatedRequest("PUT", apiUrl, employeeData)
    .then(function (response) {
      updateMessage.textContent = "Employee updated successfully!";
      document.getElementById("update-employee-form").reset();
      fetchEmployeeData();
    })
    .catch(function (error) {
      console.error("Error updating employee:", error);
      updateMessage.textContent = "Error updating employee.";
    });
}
