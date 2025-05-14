// ========== Judge Login ==========
if (window.location.pathname.includes("judge.html")) {
  document.getElementById("judgeLoginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const error = document.getElementById("error");

    const validJudges = {
      judge1: "pass1",
      judge2: "pass2",
      judge3: "pass3",
      judge4: "pass4"
    };

    if (validJudges[username] === password) {
      localStorage.setItem("loggedInJudge", username);
      window.location.href = "grade.html";
    } else {
      error.textContent = "Invalid judge username or password.";
    }
  });
}

// ========== Grade Submission ==========
if (window.location.pathname.includes("grade.html")) {
  document.addEventListener("DOMContentLoaded", function () {
    const judge = localStorage.getItem("loggedInJudge") || "Unknown";
    document.getElementById("judgeName").value = judge;

    const form = document.getElementById("gradingForm");
    const totalField = document.getElementById("totalScore");
    const successMsg = document.getElementById("success");

    const criteria = [
      ["c1a", "c1b"],
      ["c2a", "c2b"],
      ["c3a", "c3b"],
      ["c4a", "c4b"]
    ];

    criteria.flat().forEach(id => {
      const input = document.getElementById(id);
      if (input) input.addEventListener("input", calculateTotal);
    });

    function calculateTotal() {
      let total = 0;
      criteria.forEach(([lowId, highId]) => {
        const low = parseInt(document.getElementById(lowId).value) || 0;
        const high = parseInt(document.getElementById(highId).value) || 0;
        total += Math.max(low, high);
      });
      totalField.value = total;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const group = document.getElementById("groupNumber").value.trim();

      const entry = {
        judge,
        groupMembers: document.getElementById("groupMembers").value.trim(),
        projectTitle: document.getElementById("projectTitle").value.trim(),
        total: parseInt(totalField.value),
        comments: document.getElementById("comments").value.trim()
      };

      const key = `group_${group}_judge_${judge}`;
      localStorage.setItem(key, JSON.stringify(entry));

      successMsg.textContent = "Grades submitted successfully!";
      form.reset();
      totalField.value = "";
      document.getElementById("judgeName").value = judge;
    });
  });
}

// ========== Admin Login + View ==========
if (window.location.pathname.includes("admin.html")) {
  function checkAdmin() {
    const username = document.getElementById("adminUsername").value.trim();
    const password = document.getElementById("adminPassword").value.trim();
    const error = document.getElementById("adminError");

    if (username === "admin" && password === "admin123") {
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("adminPanel").style.display = "block";
      loadGrades();
    } else {
      error.textContent = "Invalid admin username or password.";
    }
  }

  function loadGrades() {
    const tbody = document.querySelector("#gradesTable tbody");
    const averages = {};
    const counts = {};
    const members = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("group_")) {
        const data = JSON.parse(localStorage.getItem(key));
        const parts = key.split("_");
        const group = parts[1];
        const judge = data.judge;

        if (!averages[group]) {
          averages[group] = 0;
          counts[group] = 0;
          members[group] = data.groupMembers;
        }

        averages[group] += data.total;
        counts[group]++;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${group}</td>
          <td>${data.groupMembers}</td>
          <td>${judge}</td>
          <td>${data.projectTitle}</td>
          <td>${data.total}</td>
          <td>${data.comments}</td>
        `;
        tbody.appendChild(row);
      }
    }

    const avgList = document.getElementById("averageList");
    avgList.innerHTML = "";
    for (const group in averages) {
      const avg = (averages[group] / counts[group]).toFixed(2);
      const li = document.createElement("li");
      li.textContent = `Group ${group} (${members[group]}): Average = ${avg}`;
      avgList.appendChild(li);
    }
  }

  function logoutAdmin() {
    document.getElementById("adminPanel").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("adminUsername").value = "";
    document.getElementById("adminPassword").value = "";
    document.getElementById("adminError").textContent = "";
    document.querySelector("#gradesTable tbody").innerHTML = "";
    document.getElementById("averageList").innerHTML = "";
  }

  // Attach to global scope
  window.checkAdmin = checkAdmin;
  window.logoutAdmin = logoutAdmin;
}
