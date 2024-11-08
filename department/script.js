document.addEventListener("DOMContentLoaded", () => {
  checkLoggedInUser(); // Run when page loads
});

let currentPage = 1;
let currentSearchPage = 1;
const rowsPerPage = 5;
var departmentList = [];

document
  .getElementById("fetch-btn")
  .addEventListener("click", fetchDepartmentData);
document
  .getElementById("search-btn")
  .addEventListener("click", fetchDepartmentById);
document
  .getElementById("create-department-form")
  .addEventListener("submit", createDepartment);
document
  .getElementById("update-department-form")
  .addEventListener("submit", updateDepartment);
document
  .getElementById("search-input")
  .addEventListener("input", searchDepartment);

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayPage(currentPage, departmentList);
  }
});

document.getElementById("next-page").addEventListener("click", () => {
  if (currentPage * rowsPerPage < departmentList.length) {
    currentPage++;
    displayPage(currentPage, departmentList);
  }
});

function fetchDepartmentData() {
  const apiUrl = "http://localhost:8081/hr-db-api/department/get/all";

  authenticatedRequest("GET", apiUrl)
    .then(function (response) {
      departmentList = response.data.content;
      displayDepartments(departmentList);
    })
    .catch(function (error) {
      console.error("Error fetching department data:", error);
    });
}

function displayDepartments(data) {
  currentPage = 1; // Reset to the first page
  displayPage(currentPage, data);
}

function displayPage(page, data) {
  const tableBody = document.querySelector("#department-table tbody");
  const searchSection = document.getElementById("search-section");

  tableBody.innerHTML = ""; // Clear previous data

  if (searchSection) {
    searchSection.classList.remove("d-none");
  }

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);
  const paginatedDepartments = data.slice(startIndex, endIndex);

  // Populate table with paginated data
  paginatedDepartments.forEach((department) => {
    const row = document.createElement("tr");

    if (!department.managerId) {
      department.managerId = "N/A";
    }

    row.innerHTML = `
      <td>${department.departmentId}</td>
      <td>${department.departmentName}</td>
      <td>${department.managerId}</td>
      <td>${department.locationId}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editDepartment(${department.departmentId})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteDepartmentById(${department.departmentId})">Delete</button>
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

function fetchDepartmentById() {
  const departmentId = document.getElementById("department-id").value;
  const departmentDetail = document.getElementById("department-detail");

  if (!departmentId) {
    departmentDetail.textContent = "Please enter a valid Department ID.";
    return;
  }

  const apiUrl = `http://localhost:8081/hr-db-api/department/get/${departmentId}`;
  departmentDetail.textContent = "Loading department data...";

  authenticatedRequest("GET", apiUrl)
    .then(function (response) {
      const data = response.data;
      displayDepartmentDetail(data);
    })
    .catch(function (error) {
      console.error("Error fetching department data:", error);
      departmentDetail.textContent = "Error loading data.";
    });
}

function displayDepartmentDetail(data) {
  const department = data.content[0]; // Assume all entries share department info
  const employees = data.content; // All entries in `content` represent employees
  const departmentDetail = document.getElementById("department-detail");
  const employeeSection = document.getElementById("employee-section");
  const employeeTableBody = document.getElementById("employee-table-body");

  if (!department) {
    departmentDetail.textContent = "No department found with the given ID.";
    employeeSection.classList.add("d-none");
    return;
  }

  if (!department.manager_id) {
    department.manager_id = "N/A";
  }

  // Display Department Info
  departmentDetail.innerHTML = `
        <h4>Department ID: ${department.department_id}</h4>
        <p><strong>Department Name:</strong> ${department.department_name}</p>
        <p><strong>Manager ID:</strong> ${department.manager_id}</p>
        <p><strong>Location ID:</strong> ${department.location_id}</p>
    `;

  employeeTableBody.innerHTML = "";

  // Clear any existing employee rows and display new ones
  console.log(employees[0].employee_id);
  if (employees[0].employee_id == null) {
    employeeSection.classList.add("d-none");
    return;
  }

  employees.forEach((employee) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${employee.employee_id}</td>
            <td>${employee.first_name}</td>
            <td>${employee.last_name}</td>
            <td>${employee.email}</td>
            <td>${employee.phone_number}</td>
            <td>${new Date(employee.hire_date).toLocaleDateString()}</td>
            <td>${employee.job_id}</td>
            <td>${employee.salary}</td>
        `;
    employeeTableBody.appendChild(row);
  });

  // Display the employee section table
  employeeSection.classList.remove("d-none");
}

function createDepartment(event) {
  event.preventDefault();
  const apiUrl = "http://localhost:8081/hr-db-api/department/create";
  const createMessage = document.getElementById("create-message");
  console.log("Creating new department...");

  const departmentData = {
    department_id: parseInt(
      document.getElementById("department-id-create").value
    ),
    department_name: document.getElementById("department-name").value,
    manager_id: parseInt(document.getElementById("manager-id").value),
    location_id: parseInt(document.getElementById("location-id").value),
  };
  console.log("New department data:", departmentData);

  createMessage.textContent = "Creating department...";

  authenticatedRequest("POST", apiUrl, departmentData)
    .then(function (response) {
      createMessage.textContent = "Department created successfully!";
      console.log("Department created successfully:", departmentData);
      document.getElementById("create-department-form").value = "";
    })
    .catch(function (error) {
      console.error("Error creating department:", error);
      createMessage.textContent = "Error creating department.";
    });
}

function deleteDepartmentById(departmentId) {
  var confirmDelete = confirm(
    "Are you sure you want to delete this department?"
  );
  if (!confirmDelete) {
    return;
  }
  console.log("Deleting department by ID:", departmentId);

  const apiUrl = `http://localhost:8081/hr-db-api/department/delete/${departmentId}`;

  authenticatedRequest("DELETE", apiUrl)
    .then(function (response) {
      console.log("Department deleted successfully:", response.data);
      fetchDepartmentData(); // Refresh the department list
    })
    .catch(function (error) {
      console.error("Error deleting department:", error);
    });
}

function updateDepartment(event) {
  event.preventDefault();

  const departmentId = document.getElementById("update-department-id").value;
  const apiUrl = `http://localhost:8081/hr-db-api/department/update/${departmentId}`;
  const updateMessage = document.getElementById("update-message");
  console.log("Updating department by ID:", departmentId);

  const departmentData = {
    department_id: parseInt(departmentId),
    department_name: document.getElementById("update-department-name").value,
    manager_id: parseInt(document.getElementById("update-manager-id").value),
    location_id: parseInt(document.getElementById("update-location-id").value),
  };
  console.log("Updated department data:", departmentData);

  updateMessage.textContent = "Updating department data...";

  authenticatedRequest("PUT", apiUrl, departmentData)
    .then(function (response) {
      updateMessage.textContent = "Department updated successfully!";
      console.log("Department updated successfully:", response.data);
      document.getElementById("update-department-form").value = "";
      fetchDepartmentData();
    })
    .catch(function (error) {
      console.error("Error updating department:", error);
      updateMessage.textContent = "Error updating department.";
    });
}

function searchDepartment() {
  const query = document.getElementById("search-input").value;
  const filteredDepartments = departmentList.filter((department) =>
    department.departmentName.toLowerCase().includes(query)
  );

  displayDepartments(filteredDepartments); // Display filtered jobs
}

function editDepartment(departmentId) {
  const department = departmentList.find(
    (dept) => dept.departmentId === departmentId
  );
  if (department) {
    document.getElementById("update-department-id").value =
      department.departmentId;
    document.getElementById("update-department-name").value =
      department.departmentName;
    document.getElementById("update-manager-id").value = department.managerId;
    document.getElementById("update-location-id").value = department.locationId;

    // Optionally, scroll to the update form section
    document.getElementById("update-department-form").scrollIntoView();
  }
}
