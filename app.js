const state = {
  mentalScore: 78,
  physicalScore: 82,
  mood: "Calm",
  activeTab: "home",
};

const tabNames = {
  home: "Home",
  mental: "Mental Health",
  physical: "Physical Health",
  sleep: "Sleep",
  insights: "AI Insights",
  reports: "Reports & History",
  emergency: "Emergency Help",
  settings: "Settings",
};

const statusForScore = (score) => {
  if (score < 30) return { key: "red", label: "Red - critical attention required" };
  if (score < 65) return { key: "yellow", label: "Yellow - needs attention" };
  return { key: "green", label: "Green - stable wellness" };
};

function setTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });
  document.getElementById("page-title").textContent = tabNames[tabId];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderScore(cardKey, score) {
  const card = document.querySelector(`[data-score-card="${cardKey}"]`);
  const status = statusForScore(score);
  card.querySelector(".status-dot").className = `status-dot ${status.key}`;
  card.querySelector("strong").textContent = score;
  card.querySelector("small").textContent = status.label;
}

function updateEmergencyMode() {
  const active = state.mentalScore < 30 || state.physicalScore < 30;
  document.body.classList.toggle("emergency-active", active);
  document.getElementById("emergency-alert").classList.toggle("hidden", !active);

  if (active) {
    document.querySelectorAll(".traffic-badge").forEach((badge) => {
      if (badge.textContent.includes("Green") || badge.textContent.includes("Low Risk")) {
        badge.textContent = "Red Critical";
        badge.className = "traffic-badge red";
      }
    });
  }
}

function drawCharts() {
  document.querySelectorAll(".mini-chart").forEach((chart) => {
    const values = chart.dataset.chart.split(",").map(Number);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = Math.max(max - min, 1);
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 86 - ((value - min) / range) * 64;
      return `${x},${y}`;
    });
    const area = `0,100 ${points.join(" ")} 100,100`;
    chart.innerHTML = `
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="${area}" fill="rgba(84,184,255,.18)"></polygon>
        <polyline points="${points.join(" ")}" fill="none" stroke="url(#lineGradient)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"></polyline>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#2369d8"></stop>
            <stop offset="100%" stop-color="#46e5ff"></stop>
          </linearGradient>
        </defs>
      </svg>
    `;
  });
}

function addChatMessage(text, sender = "bot") {
  const message = document.createElement("p");
  message.className = sender;
  message.textContent = text;
  const body = document.querySelector(".chat-body");
  body.appendChild(message);
  body.scrollTop = body.scrollHeight;
}

function renderApiStack() {
  const grid = document.getElementById("api-grid");
  if (!grid || !window.NeuroWellIntegrations) return;
  grid.innerHTML = window.NeuroWellIntegrations.apiStack
    .map((api) => `
      <article class="api-item">
        <strong>${api.name}</strong>
        <small>${api.mvp ? "MVP priority" : "Expansion API"} - ${api.purpose}</small>
      </article>
    `)
    .join("");
}

function chatbotReply(input) {
  const normalized = input.toLowerCase();
  if (normalized.includes("sleep")) {
    return "Let's keep it gentle: dim lights early, avoid late caffeine, and try a 4-minute breathing reset before bed.";
  }
  if (normalized.includes("stress") || normalized.includes("panic") || normalized.includes("anxious")) {
    return "I'm here. Try naming 5 things you see, then take one slow inhale and a longer exhale. If you feel unsafe, open Emergency Help and contact support.";
  }
  if (normalized.includes("medicine") || normalized.includes("medication")) {
    return "Today's reminder is Vitamin D at 8:30 PM. I'll keep reminders calm and easy to snooze.";
  }
  return "A natural first step: hydrate, breathe slowly for one minute, and choose one small action that feels manageable right now.";
}

function handleCheckin() {
  const note = document.getElementById("mood-note");
  document.getElementById("current-mood").textContent = state.mood;

  if (state.mood === "Anxious") {
    state.mentalScore = 58;
  } else if (state.mood === "Tired") {
    state.mentalScore = 66;
  } else {
    state.mentalScore = 78;
  }

  renderScore("mental", state.mentalScore);
  updateEmergencyMode();
  addChatMessage(`I noticed you're feeling ${state.mood.toLowerCase()}. ${note.value ? "Thanks for sharing that note." : "A short reset may help keep the day steady."}`);
  if (window.NeuroWellIntegrations) {
    window.NeuroWellIntegrations.generateWellnessInsight({
      mood: state.mood,
      note: note.value,
      mentalScore: state.mentalScore,
    });
  }
  document.getElementById("chatbot").classList.add("open");
}

function triggerSOS() {
  state.mentalScore = 24;
  renderScore("mental", state.mentalScore);
  updateEmergencyMode();
  setTab("emergency");
  if (window.NeuroWellIntegrations) {
    window.NeuroWellIntegrations.runEmergencyProtocol({
      severe: true,
      mentalScore: state.mentalScore,
      physicalScore: state.physicalScore,
    });
  }
  addChatMessage("Emergency monitoring is active. I'm starting calm grounding support and notifying the wellness support team before escalating contacts.");
  document.getElementById("chatbot").classList.add("open");
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tab));
});

document.querySelectorAll("[data-tab-shortcut]").forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tabShortcut));
});

document.querySelectorAll(".mood-row button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mood-row button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.mood = button.dataset.mood;
  });
});

document.querySelector('[data-mood="Calm"]').classList.add("active");
document.getElementById("save-checkin").addEventListener("click", handleCheckin);
document.getElementById("sos-button").addEventListener("click", triggerSOS);

document.getElementById("mode-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.getElementById("mode-toggle").textContent = document.body.classList.contains("dark") ? "Light" : "Dark";
});

document.getElementById("chat-toggle").addEventListener("click", () => {
  document.getElementById("chatbot").classList.add("open");
});

document.getElementById("open-chat").addEventListener("click", () => {
  document.getElementById("chatbot").classList.add("open");
});

document.getElementById("close-chat").addEventListener("click", () => {
  document.getElementById("chatbot").classList.remove("open");
});

document.querySelector(".chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector("input");
  const value = input.value.trim();
  if (!value) return;
  addChatMessage(value, "user");
  input.value = "";
  setTimeout(() => addChatMessage(chatbotReply(value)), 280);
});

document.getElementById("run-ai-sample")?.addEventListener("click", async () => {
  const result = await window.NeuroWellIntegrations.generateWellnessInsight({
    mood: state.mood,
    mentalScore: state.mentalScore,
    physicalScore: state.physicalScore,
  });
  addChatMessage(`${result.status}: ${result.message}`);
  document.getElementById("chatbot").classList.add("open");
});

drawCharts();
renderApiStack();
renderScore("mental", state.mentalScore);
renderScore("physical", state.physicalScore);
updateEmergencyMode();
