document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities", {
        cache: "no-store",
      });
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <p><strong>Participants:</strong></p>
            <ul class="participants-list">
              ${
                details.participants.length
                  ? details.participants
                      .map(
                        (participant) => `
                          <li class="participant-item">
                            <span class="participant-email">${participant}</span>
                            <button
                              type="button"
                              class="participant-remove"
                              data-activity="${name}"
                              data-email="${participant}"
                              aria-label="Unregister ${participant} from ${name}"
                              title="Unregister"
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M9 3.5h6a1 1 0 0 1 1 1V6h4a1 1 0 1 1 0 2h-1.1l-.8 10.2A2.5 2.5 0 0 1 15.61 20H8.39a2.5 2.5 0 0 1-2.49-1.8L5.1 8H4a1 1 0 0 1 0-2h4V4.5a1 1 0 0 1 1-1Zm1 2.5h4V5h-4v1ZM7.12 8l.79 9.9c.03.31.29.55.6.55h7a.6.6 0 0 0 .6-.55L16.9 8H7.12Zm2.38 2.2a.8.8 0 0 1 .8.8v3.4a.8.8 0 1 1-1.6 0V11a.8.8 0 0 1 .8-.8Zm4 0a.8.8 0 0 1 .8.8v3.4a.8.8 0 1 1-1.6 0V11a.8.8 0 0 1 .8-.8Z"/>
                              </svg>
                            </button>
                          </li>
                        `
                      )
                      .join("")
                  : '<li class="empty-state">No participants yet</li>'
              }
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      activitiesList.querySelectorAll(".participant-remove").forEach((button) => {
        button.addEventListener("click", async () => {
          const activity = button.dataset.activity;
          const email = button.dataset.email;

          try {
            const response = await fetch(
              `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
              {
                method: "DELETE",
              }
            );

            const result = await response.json();

            if (response.ok) {
              showMessage(result.message, "success");
              fetchActivities();
            } else {
              showMessage(result.detail || "An error occurred", "error");
            }
          } catch (error) {
            showMessage("Failed to unregister participant. Please try again.", "error");
            console.error("Error unregistering participant:", error);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
