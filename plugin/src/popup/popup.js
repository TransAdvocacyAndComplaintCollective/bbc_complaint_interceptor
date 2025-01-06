// popup.js

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize elements
  const helpLink = document.getElementById("help-link");
  const sendStatus = document.getElementById("send-status");
  const checkStoriesBtn = document.getElementById("check-stories-btn");
  const storiesList = document.getElementById("stories-list");
  const tableBody = document.querySelector("#complaintsTable tbody");
  const versionElement = document.getElementById("version");

  // Handle help link click
  if (helpLink) {
    helpLink.addEventListener("click", (e) => {
      e.preventDefault();
      const helpUrl = browser.runtime.getURL("help/help.html");
      browser.tabs.create({ url: helpUrl });
    });
  }

  // -----------------------------
  // Part 1: Complaints Table
  // -----------------------------
  if (tableBody) {
    // Load complaints array from browser.storage.local
    let bbcComplaints = [];
    try {
      const result = await browser.storage.local.get("bbcComplaints");
      bbcComplaints = result.bbcComplaints || [];
    } catch (error) {
      console.error("Error loading complaints from storage:", error);
    }

    // Function to render the table
    function renderTable() {
      // Clear existing table rows
      tableBody.innerHTML = "";

      if (bbcComplaints.length === 0) {
        // Placeholder row if no complaints
        const placeholderRow = document.createElement("tr");
        const placeholderCell = document.createElement("td");
        placeholderCell.colSpan = 4;
        placeholderCell.textContent = "No complaints stored.";
        placeholderRow.appendChild(placeholderCell);
        tableBody.appendChild(placeholderRow);
        return;
      }

      // Populate table with complaints
      bbcComplaints.forEach((complaint, index) => {
        const row = document.createElement("tr");

        // Subject Cell
        const subjectCell = document.createElement("td");
        subjectCell.textContent = complaint.subject || "N/A";
        row.appendChild(subjectCell);

        // ID Cell
        const idCell = document.createElement("td");
        const idLink = document.createElement("a");
        idLink.href = "https://tacc.org.uk/media-complaints-response-form/?uuid=" + complaint.id;
        idLink.textContent = complaint.id || "N/A";
        idLink.target = "_blank";
        idCell.appendChild(idLink);
        row.appendChild(idCell);

        // Date Cell
        const dateCell = document.createElement("td");
        dateCell.textContent = complaint.dateRetrieved
          ? new Date(complaint.dateRetrieved).toLocaleString()
          : "N/A";
        row.appendChild(dateCell);

        // Action Cell (Delete Button)
        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        // Delete button click handler
        deleteButton.addEventListener("click", async () => {
          // Remove complaint from array
          bbcComplaints.splice(index, 1);
          try {
            // Update storage
            await browser.storage.local.set({ bbcComplaints });
            // Re-render table
            renderTable();
          } catch (error) {
            console.error("Error updating storage after deletion:", error);
          }
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        // Append row to table
        tableBody.appendChild(row);
      });
    }

    // Initial render
    renderTable();
  }

  // -----------------------------
  // Part 2: Check Problematic Stories
  // -----------------------------
  if (sendStatus && checkStoriesBtn && storiesList) {
    // Function to update send status
    function updateSendStatus(status) {
      sendStatus.textContent = status;
    }

    // Function to display stories
    function displayStories(stories) {
      storiesList.innerHTML = "";
      if (!stories || stories.length === 0) {
        storiesList.textContent = "No problematic stories found.";
        return;
      }

      const ul = document.createElement("ul");
      stories.forEach(story => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = story.url;
        link.textContent = story.title;
        link.target = "_blank";
        li.appendChild(link);
        ul.appendChild(li);
      });
      storiesList.appendChild(ul);
    }

    // Handle check stories button click
    checkStoriesBtn.addEventListener("click", async () => {
      checkStoriesBtn.disabled = true;
      checkStoriesBtn.textContent = "Checking...";

      try {
        updateSendStatus("Fetching...");
        const response = await fetch("https://tacc.org.uk/api/problematic");
        if (response.ok) {
          const data = await response.json();
          displayStories(data);
          updateSendStatus("Done");
        } else {
          storiesList.textContent = "Failed to fetch problematic stories.";
          updateSendStatus("Error");
        }
      } catch (error) {
        console.error("Error fetching problematic stories:", error);
        storiesList.textContent = "Error fetching stories.";
        updateSendStatus("Error");
      } finally {
        checkStoriesBtn.disabled = false;
        checkStoriesBtn.textContent = "Check Problematic Stories";
      }
    });
  }

  // -----------------------------
  // Part 3: Show Easter Egg
  // -----------------------------
  if (versionElement) {
    showEasterEgg(versionElement);
  }
});

// Easter Egg function fixed
function showEasterEgg(versionElement) {
  const userAgent = navigator.userAgent.toUpperCase();
  if (!userAgent.includes('MAC')) {
    return;
  }

  const randomNumber = Math.floor(Math.random() * 100) + 1;
  if (randomNumber !== 42) {
    return;
  }

  const date = new Date();
  // Note: JavaScript months are 0-based (0 = January, 1 = February, etc.)
  if (date.getMonth() === 2 && date.getDate() === 31) { // March 31
    versionElement.textContent = "Hoping having a good Transgender Day of Visibility!";
    return;
  }

  const randomNumber2 = Math.floor(Math.random() * 10) + 1;
  const messages = {
    1: "You're a star!",
    2: "You're doing great!",
    3: "You're amazing!",
    4: "Lucy is the best!",
    5: "You're a legend!",
    6: "You're a hero!",
    7: "Life, the universe, and everything!",
    8: "You're a superstar!",
    9: "Lucy is the Best!",
    10: "You're a hero!"
  };

  versionElement.textContent = messages[randomNumber2] || "Keep up the great work!";
}
