(() => {
  "use strict";

  const SCORE_THRESHOLDS = {
    critical: 30,
    attention: 65,
  };

  const INITIAL_STATE = Object.freeze({
    mentalScore: 78,
    physicalScore: 82,
    mood: "Calm",
    activeTab: "home",
  });

  const TAB_NAMES = Object.freeze({
    home: "Home",
    mental: "Mental Health",
    physical: "Physical Health",
    sleep: "Sleep",
    insights: "AI Insights",
    reports: "Reports & History",
    emergency: "Emergency Help",
    settings: "Settings",
  });

  const MOOD_SCORE_MAP = Object.freeze({
    Calm: 78,
    Okay: 74,
    Tired: 66,
    Anxious: 58,
  });

  const CHAT_RESPONSES = Object.freeze([
    {
      keywords: ["sleep", "bed", "rest"],
      response: "Let's keep it gentle: dim lights early, avoid late caffeine, and try a 4-minute breathing reset before bed.",
    },
    {
      keywords: ["stress", "panic", "anxious", "anxiety", "overwhelmed"],
      response: "I'm here. Try naming 5 things you see, then take one slow inhale and a longer exhale. If you feel unsafe, open Emergency Help and contact support.",
    },
    {
      keywords: ["medicine", "medication", "pill", "reminder"],
      response: "Today's reminder is Vitamin D at 8:30 PM. I'll keep reminders calm and easy to snooze.",
    },
  ]);

  const state = { ...INITIAL_STATE };

  const dom = {
    body: document.body,
    pageTitle: document.getElementById("page-title"),
    emergencyAlert: document.getElementById("emergency-alert"),
    moodNote: document.getElementById("mood-note"),
    currentMood: document.getElementById("current-mood"),
    chatbot: document.getElementById("chatbot"),
    chatBody: document.querySelector(".chat-body"),
    chatForm: document.querySelector(".chat-form"),
    modeToggle: document.getElementById("mode-toggle"),
    apiGrid: document.getElementById("api-grid"),
    navItems: [...document.querySelectorAll(".nav-item")],
    panels: [...document.querySelectorAll(".tab-panel")],
    shortcutButtons: [...document.querySelectorAll("[data-tab-shortcut]")],
    moodButtons: [...document.querySelectorAll(".mood-row button")],
  };

  const integrations = window.NeuroWellIntegrations;

  function getStatusForScore(score) {
    if (score < SCORE_THRESHOLDS.critical) {
      return { key: "red", label: "Red - critical attention required" };
    }
    if (score < SCORE_THRESHOLDS.attention) {
      return { key: "yellow", label: "Yellow - needs attention" };
    }
    return { key: "green", label: "Green - stable wellness" };
  }

  function getScoreCard(cardKey) {
    return document.querySelector(`[data-score-card="${cardKey}"]`);
  }

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function openChat() {
    dom.chatbot?.classList.add("open");
  }

  function closeChat() {
    dom.chatbot?.classList.remove("open");
  }

  function setTab(tabId) {
    if (!TAB_NAMES[tabId]) return;

    state.activeTab = tabId;
    dom.navItems.forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tabId);
    });
    dom.panels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === tabId);
    });
    setText(dom.pageTitle, TAB_NAMES[tabId]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderScore(cardKey, score) {
    const card = getScoreCard(cardKey);
    if (!card) return;

    const status = getStatusForScore(score);
    const dot = card.querySelector(".status-dot");
    if (dot) dot.className = `status-dot ${status.key}`;
    setText(card.querySelector("strong"), String(score));
    setText(card.querySelector("small"), status.label);
  }

  function updateTrafficBadgesForEmergency(active) {
    if (!active) return;

    document.querySelectorAll(".traffic-badge").forEach((badge) => {
      const shouldEscalate = badge.textContent.includes("Green") || badge.textContent.includes("Low Risk");
      if (!shouldEscalate) return;

      badge.textContent = "Red Critical";
      badge.className = "traffic-badge red";
    });
  }

  function updateEmergencyMode() {
    const active = state.mentalScore < SCORE_THRESHOLDS.critical || state.physicalScore < SCORE_THRESHOLDS.critical;
    dom.body.classList.toggle("emergency-active", active);
    dom.emergencyAlert?.classList.toggle("hidden", !active);
    updateTrafficBadgesForEmergency(active);
  }

  function createSvgElement(name, attributes = {}) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }

  function parseChartValues(chart) {
    return (chart.dataset.chart || "")
      .split(",")
      .map((value) => Number(value.trim()))
      .filter(Number.isFinite);
  }

  function drawChart(chart) {
    const values = parseChartValues(chart);
    if (values.length < 2) return;

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = Math.max(max - min, 1);
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 86 - ((value - min) / range) * 64;
      return `${x},${y}`;
    });

    const svg = createSvgElement("svg", {
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      "aria-hidden": "true",
    });

    const gradientId = `line-gradient-${Math.random().toString(36).slice(2)}`;
    const defs = createSvgElement("defs");
    const gradient = createSvgElement("linearGradient", {
      id: gradientId,
      x1: "0%",
      y1: "0%",
      x2: "100%",
      y2: "0%",
    });
    gradient.append(
      createSvgElement("stop", { offset: "0%", "stop-color": "#2369d8" }),
      createSvgElement("stop", { offset: "100%", "stop-color": "#46e5ff" }),
    );
    defs.append(gradient);

    svg.append(
      createSvgElement("polygon", {
        points: `0,100 ${points.join(" ")} 100,100`,
        fill: "rgba(84,184,255,.18)",
      }),
      createSvgElement("polyline", {
        points: points.join(" "),
        fill: "none",
        stroke: `url(#${gradientId})`,
        "stroke-width": "3.6",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
      defs,
    );

    chart.replaceChildren(svg);
  }

  function drawCharts() {
    document.querySelectorAll(".mini-chart").forEach(drawChart);
  }

  function addChatMessage(text, sender = "bot") {
    if (!dom.chatBody) return;

    const message = document.createElement("p");
    message.className = sender;
    message.textContent = text;
    dom.chatBody.append(message);
    dom.chatBody.scrollTop = dom.chatBody.scrollHeight;
  }

  function renderApiStack() {
    if (!dom.apiGrid || !integrations?.apiStack) return;

    const fragment = document.createDocumentFragment();
    integrations.apiStack.forEach((api) => {
      const item = document.createElement("article");
      const name = document.createElement("strong");
      const details = document.createElement("small");

      item.className = "api-item";
      name.textContent = api.name;
      details.textContent = `${api.mvp ? "MVP priority" : "Expansion API"} - ${api.purpose}`;

      item.append(name, details);
      fragment.append(item);
    });

    dom.apiGrid.replaceChildren(fragment);
  }

  function getChatbotReply(input) {
    const normalized = input.toLowerCase();
    const match = CHAT_RESPONSES.find(({ keywords }) => keywords.some((keyword) => normalized.includes(keyword)));
    return match?.response || "A natural first step: hydrate, breathe slowly for one minute, and choose one small action that feels manageable right now.";
  }

  function updateMood(nextMood) {
    state.mood = nextMood;
    dom.moodButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.mood === nextMood);
    });
  }

  async function requestWellnessInsight() {
    if (!integrations) return null;

    return integrations.generateWellnessInsight({
      mood: state.mood,
      note: dom.moodNote?.value || "",
      mentalScore: state.mentalScore,
      physicalScore: state.physicalScore,
    });
  }

  async function handleCheckin() {
    const note = dom.moodNote?.value || "";
    state.mentalScore = MOOD_SCORE_MAP[state.mood] || INITIAL_STATE.mentalScore;

    setText(dom.currentMood, state.mood);
    renderScore("mental", state.mentalScore);
    updateEmergencyMode();

    addChatMessage(`I noticed you're feeling ${state.mood.toLowerCase()}. ${note ? "Thanks for sharing that note." : "A short reset may help keep the day steady."}`);
    await requestWellnessInsight();
    openChat();
  }

  async function triggerSOS() {
    state.mentalScore = 24;
    renderScore("mental", state.mentalScore);
    updateEmergencyMode();
    setTab("emergency");

    await integrations?.runEmergencyProtocol({
      severe: true,
      mentalScore: state.mentalScore,
      physicalScore: state.physicalScore,
    });

    addChatMessage("Emergency monitoring is active. I'm starting calm grounding support and notifying the wellness support team before escalating contacts.");
    openChat();
  }

  function toggleTheme() {
    const isDark = dom.body.classList.toggle("dark");
    setText(dom.modeToggle, isDark ? "Light" : "Dark");
  }

  function bindEvents() {
    dom.navItems.forEach((button) => {
      button.addEventListener("click", () => setTab(button.dataset.tab));
    });

    dom.shortcutButtons.forEach((button) => {
      button.addEventListener("click", () => setTab(button.dataset.tabShortcut));
    });

    dom.moodButtons.forEach((button) => {
      button.addEventListener("click", () => updateMood(button.dataset.mood));
    });

    document.getElementById("save-checkin")?.addEventListener("click", handleCheckin);
    document.getElementById("sos-button")?.addEventListener("click", triggerSOS);
    document.getElementById("chat-toggle")?.addEventListener("click", openChat);
    document.getElementById("open-chat")?.addEventListener("click", openChat);
    document.getElementById("close-chat")?.addEventListener("click", closeChat);
    dom.modeToggle?.addEventListener("click", toggleTheme);

    dom.chatForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = event.currentTarget.querySelector("input");
      const value = input?.value.trim();
      if (!value) return;

      addChatMessage(value, "user");
      input.value = "";
      window.setTimeout(() => addChatMessage(getChatbotReply(value)), 280);
    });

    document.getElementById("run-ai-sample")?.addEventListener("click", async () => {
      const result = await requestWellnessInsight();
      addChatMessage(`${result?.status || "mocked"}: ${result?.message || "AI orchestration preview is ready."}`);
      openChat();
    });
  }

  function init() {
    bindEvents();
    updateMood(INITIAL_STATE.mood);
    drawCharts();
    renderApiStack();
    renderScore("mental", state.mentalScore);
    renderScore("physical", state.physicalScore);
    updateEmergencyMode();
  }

  init();
})();
