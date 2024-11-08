document.addEventListener("DOMContentLoaded", () => {
  checkLoggedInUser(); // Run when page loads
});

let currentPage = 1;
let currentSearchPage = 1;
const rowsPerPage = 5;
var jobList = [];

let currentPageJH = 1;
const rowsPerPageJH = 5;
let jobHistoryList = [];

document.getElementById("fetch-btn").addEventListener("click", fetchJobData);
document.getElementById("search-btn").addEventListener("click", fetchJobById);
document.getElementById("search-input").addEventListener("input", searchJobs);
document
  .getElementById("fetch-btn-jh")
  .addEventListener("click", fetchJobHistoryData);
document
  .getElementById("search-input-jh")
  .addEventListener("input", searchJobHistory);

document.getElementById("prev-page-jh").addEventListener("click", () => {
  if (currentPageJH > 1) {
    currentPageJH--;
    displayJHPage(currentPageJH, jobHistoryList);
  }
});

document.getElementById("next-page-jh").addEventListener("click", () => {
  if (currentPageJH * rowsPerPageJH < jobHistoryList.length) {
    currentPageJH++;
    displayJHPage(currentPageJH, jobHistoryList);
  }
});

document
  .getElementById("create-job-form")
  .addEventListener("submit", createJob);
document
  .getElementById("update-job-form")
  .addEventListener("submit", updateJob);

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayPage(currentPage, jobList);
  }
});

document.getElementById("next-page").addEventListener("click", () => {
  if (currentPage * rowsPerPage < jobList.length) {
    currentPage++;
    displayPage(currentPage, jobList);
  }
});

function fetchJobData() {
  const apiUrl = "http://localhost:8081/hr-db-api/job/get/all";
  authenticatedRequest("GET", apiUrl)
    .then((response) => {
      jobList = response.data.content; // Store all jobs
      displayJobs(jobList);
    })
    .catch((error) => {
      console.error("Error fetching job data:", error);
      document.getElementById("info-message").textContent =
        "Error loading data.";
    });
}

function displayJobs(data) {
  currentPage = 1; // Reset to the first page
  displayPage(currentPage, data);
}

function displayPage(page, data) {
  const tableBody = document.querySelector("#job-table tbody");
  const searchSection = document.getElementById("search-section");

  tableBody.innerHTML = ""; // Clear previous data

  if (searchSection) {
    searchSection.classList.remove("d-none");
  }

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);
  const paginatedJobs = data.slice(startIndex, endIndex);

  paginatedJobs.forEach((job) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${job.jobId}</td>
      <td>${job.jobTitle}</td>
      <td>${job.minSalary}</td>
      <td>${job.maxSalary}</td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="editJob('${job.jobId}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteJobById('${job.jobId}')">Delete</button>
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

function searchJobs() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const filteredJobs = jobList.filter((job) =>
    job.jobTitle.toLowerCase().includes(query)
  );

  displayJobs(filteredJobs); // Display filtered jobs
}

function fetchJobById() {
  const jobId = document.getElementById("job-id").value;
  const jobDetail = document.getElementById("job-detail");

  if (!jobId) {
    jobDetail.textContent = "Please enter a valid Job ID.";
    return;
  }

  const apiUrl = `http://localhost:8081/hr-db-api/job/get/jobid/${jobId}`;
  jobDetail.textContent = "Loading job data...";

  authenticatedRequest("GET", apiUrl)
    .then(function (response) {
      const data = response.data;
      displayJobDetail(data);
    })
    .catch(function (error) {
      console.error("Error fetching job data:", error);
      jobDetail.textContent = "Error loading data.";
    });
}

function displayJobDetail(data) {
  const job = data.content[0]; // Assume all entries share job info
  const employees = data.content; // All entries in `content` represent employees
  const jobDetail = document.getElementById("job-detail");
  const employeeSection = document.getElementById("employee-section");
  const employeeTableBody = document.getElementById("employee-table-body");

  if (!job) {
    jobDetail.textContent = "No job found with the given ID.";
    employeeSection.classList.add("d-none");
    return;
  }

  // Display Job Info
  jobDetail.innerHTML = `
        <h4>Job ID: ${job.job_id}</h4>
        <p><strong>Job Title:</strong> ${job.job_title}</p>
    `;

  console.log(employees[0].employee_id);
  if (employees[0].employee_id == null) {
    employeeSection.classList.add("d-none");
    return;
  }

  // Clear any existing employee rows and display new ones
  employeeTableBody.innerHTML = "";
  employees.forEach((employee) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${employee.employee_id}</td>
            <td>${employee.first_name}</td>
            <td>${employee.last_name}</td>
            <td>${employee.salary}</td>
        `;
    employeeTableBody.appendChild(row);
  });

  // Display the employee section table
  employeeSection.classList.remove("d-none");
}

function createJob(event) {
  event.preventDefault();
  const apiUrl = "http://localhost:8081/hr-db-api/job/create";
  const createMessage = document.getElementById("create-message");
  console.log("Creating new job...");

  const jobData = {
    jobId: document.getElementById("job-id-create").value,
    jobTitle: document.getElementById("job-title").value,
    minSalary: parseInt(document.getElementById("min-salary").value),
    maxSalary: parseInt(document.getElementById("max-salary").value),
  };
  console.log("New job data:", jobData);

  createMessage.textContent = "Creating job...";

  authenticatedRequest("POST", apiUrl, jobData)
    .then(function (response) {
      createMessage.textContent = "Job created successfully!";
      console.log("Job created successfully:", jobData);
      document.getElementById("create-job-form").value = "";
    })
    .catch(function (error) {
      console.error("Error creating job:", error);
      createMessage.textContent = "Error creating job.";
    });
}

function deleteJobById(jobId) {
  const confirmDelete = confirm("Are you sure you want to delete this job?");
  if (!confirmDelete) return;

  const apiUrl = `http://localhost:8081/hr-db-api/job/delete/${jobId}`;
  authenticatedRequest("DELETE", apiUrl)
    .then(() => {
      fetchJobData(); // Refresh job data
    })
    .catch((error) => {
      console.error("Error deleting job:", error);
      document.getElementById("info-message").textContent =
        "Error deleting job.";
    });
}

function updateJob(event) {
  event.preventDefault();

  const jobId = document.getElementById("update-job-id").value;
  const apiUrl = `http://localhost:8081/hr-db-api/job/update/${jobId}`;
  const updateMessage = document.getElementById("update-message");
  console.log("Updating job by ID:", jobId);

  const jobData = {
    jobId: jobId,
    jobTitle: document.getElementById("update-job-title").value,
    minSalary: parseInt(document.getElementById("update-min-salary").value),
    maxSalary: parseInt(document.getElementById("update-max-salary").value),
  };

  console.log("Updated job data:", jobData);

  updateMessage.textContent = "Updating job data...";

  authenticatedRequest("PUT", apiUrl, jobData)
    .then(function (response) {
      updateMessage.textContent = "Job updated successfully!";
      console.log("Job updated successfully:", response.data);
      document.getElementById("update-job-form").reset(); // Clear the form
      fetchJobData(); // Refresh job data
      if (document.getElementById("job-detail")) {
        document.getElementById("job-detail").value = jobId;
        fetchJobById();
      }
    })
    .catch(function (error) {
      console.error("Error updating job:", error);
      updateMessage.textContent = "Error updating job.";
    });
}

function editJob(jobId) {
  const job = jobList.find((j) => j.jobId === jobId);
  if (!job) {
    console.error("Job not found for editing:", jobId);
    return;
  }

  document.getElementById("update-job-id").value = job.jobId;
  document.getElementById("update-job-title").value = job.jobTitle;
  document.getElementById("update-min-salary").value = job.minSalary;
  document.getElementById("update-max-salary").value = job.maxSalary;

  document.getElementById("update-job-form").scrollIntoView();
}

function fetchJobHistoryData() {
  const apiUrl = "http://localhost:8081/hr-db-api/job/get/history/fullall";
  authenticatedRequest("GET", apiUrl)
    .then((response) => {
      jobHistoryList = response.data.content; // Store all jobs
      displayJobHistory(jobHistoryList);
    })
    .catch((error) => {
      console.error("Error fetching job history data:", error);
      document.getElementById("info-message-jh").textContent =
        "Error loading data.";
    });
}

function displayJobHistory(data) {
  currentPage = 1; // Reset to the first page
  console.log(data);
  displayJHPage(currentPage, data);
}

function displayJHPage(page, data) {
  const tableBodyJH = document.querySelector("#job-history-table tbody");
  const searchSectionJH = document.getElementById("search-section-jh");

  tableBodyJH.innerHTML = ""; // Clear previous data

  if (searchSectionJH) {
    searchSectionJH.classList.remove("d-none");
  }
  console.log(data);
  console.log(data.length);

  const startIndexJH = (page - 1) * rowsPerPageJH;
  const endIndexJH = Math.min(startIndexJH + rowsPerPageJH, data.length);
  const paginatedJobHistory = data.slice(startIndexJH, endIndexJH);

  paginatedJobHistory.forEach((jh) => {
    const rowJH = document.createElement("tr");
    rowJH.innerHTML = `
      <td>${jh.employee_id}</td>
      <td>${jh.first_name}</td>
      <td>${jh.last_name}</td>
      <td>${jh.start_date}</td>
      <td>${jh.end_date}</td>
      <td>${jh.job_title}</td>
      <td>${jh.department_name}</td>
    `;
    tableBodyJH.appendChild(rowJH);
  });

  let totalPagesJH = Math.ceil(data.length / rowsPerPageJH);

  document.getElementById(
    "page-info-jh"
  ).textContent = `Page ${page} out of ${totalPagesJH}`;
  document.getElementById("prev-page-jh").disabled = page === 1;
  document.getElementById("next-page-jh").disabled = endIndexJH >= data.length;
}

function searchJobHistory() {
  const query = document.getElementById("search-input-jh").value.toLowerCase();
  const filteredHistory = jobHistoryList.filter(
    (jh) =>
      jh.first_name.toLowerCase().includes(query) ||
      jh.last_name.toLowerCase().includes(query)
  );

  displayJobHistory(filteredHistory); // Display filtered jobs
}
