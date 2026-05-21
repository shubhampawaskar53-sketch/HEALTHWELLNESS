(() => {
  "use strict";

  const API_STACK = Object.freeze([
    {
      id: "openai",
      name: "OpenAI API",
      route: "/api/ai/chat",
      purpose: "Chatbot, wellness summaries, multilingual emotional support, and personalized recommendations.",
      mvp: true,
    },
    {
      id: "hume",
      name: "Hume AI",
      route: "/api/voice/emotion",
      purpose: "Voice emotion analysis, stress signals, sadness, anxiety, fatigue, and emotional energy.",
      mvp: true,
    },
    {
      id: "assemblyai",
      name: "AssemblyAI",
      route: "/api/voice/transcribe",
      purpose: "Speech-to-text, voice sentiment, real-time voice check-ins, and tone detection.",
      mvp: true,
    },
    {
      id: "firebase",
      name: "Firebase",
      route: "/api/data/firebase",
      purpose: "Auth, secure storage, analytics, real-time database, and calm push notifications.",
      mvp: true,
    },
    {
      id: "google-fit",
      name: "Google Fit API",
      route: "/api/wearables/google-fit",
      purpose: "Steps, calories, sleep, heart rate, activity duration, and wearable sync.",
      mvp: true,
    },
    {
      id: "fitbit",
      name: "Fitbit Web API",
      route: "/api/wearables/fitbit",
      purpose: "Advanced sleep, stress, wellness scoring, activity, and heart-rate tracking.",
      mvp: true,
    },
    {
      id: "twilio",
      name: "Twilio API",
      route: "/api/emergency/twilio",
      purpose: "Emergency SMS, calls, OTP, and below-30 critical contact alerts.",
      mvp: true,
    },
    {
      id: "chartjs",
      name: "Chart.js",
      route: "client",
      purpose: "Mental, physical, sleep, and monthly wellness visualizations.",
      mvp: true,
    },
    {
      id: "healthkit",
      name: "Apple HealthKit",
      route: "/api/wearables/healthkit",
      purpose: "iPhone health, sleep, heartbeat, workout, and activity integration.",
      mvp: false,
    },
    {
      id: "infermedica",
      name: "Infermedica API",
      route: "/api/medical/infermedica",
      purpose: "Symptom analysis, disease prediction, and preventive health guidance.",
      mvp: false,
    },
    {
      id: "human-api",
      name: "Human API",
      route: "/api/wearables/human-api",
      purpose: "Centralized medical data and multi-device health aggregation.",
      mvp: false,
    },
    {
      id: "fcm",
      name: "Firebase Cloud Messaging",
      route: "/api/notifications/fcm",
      purpose: "Wellness reminders, medication notifications, sleep prompts, and stress alerts.",
      mvp: false,
    },
    {
      id: "supabase",
      name: "Supabase",
      route: "/api/data/supabase",
      purpose: "PostgreSQL, auth, real-time syncing, and scalable backend infrastructure.",
      mvp: false,
    },
    {
      id: "maps",
      name: "Google Maps Platform",
      route: "/api/emergency/nearby-care",
      purpose: "Nearby hospitals, live location, emergency centers, and assistance routing.",
      mvp: false,
    },
  ]);

  const safeClone = (value) => JSON.parse(JSON.stringify(value));

  async function request(route, payload = {}) {
    return {
      route,
      payload: safeClone(payload),
      status: "mocked",
      message: "Production builds should send this through a secure Node/Express backend route.",
      timestamp: new Date().toISOString(),
    };
  }

  async function generateWellnessInsight(checkin) {
    return request("/api/ai/chat", {
      provider: "openai",
      task: "supportive_wellness_recommendation",
      checkin,
      guardrails: ["natural_recovery_first", "crisis_support_if_needed", "no_diagnosis"],
    });
  }

  async function analyzeVoice(sampleId) {
    const transcription = await request("/api/voice/transcribe", {
      provider: "assemblyai",
      sampleId,
    });
    const emotion = await request("/api/voice/emotion", {
      provider: "hume",
      sampleId,
      signals: ["stress", "sadness", "anxiety", "fatigue", "emotional_energy"],
    });

    return { transcription, emotion };
  }

  async function syncWearables(userId) {
    const providers = ["google-fit", "fitbit", "healthkit", "human-api"];
    return Promise.all(
      providers.map((provider) => request(`/api/wearables/${provider}`, { provider, userId })),
    );
  }

  async function runEmergencyProtocol(event) {
    const stageOne = await request("/api/emergency/ai-critical-alert", {
      provider: "openai",
      event,
      guidance: ["breathing", "grounding", "seek_support"],
    });
    const stageTwo = await request("/api/emergency/support-team", {
      notify: ["internal_wellness_staff", "assigned_healthcare_professionals"],
      event,
    });
    const stageThree = event.severe
      ? await request("/api/emergency/twilio", {
          notify: "emergency_contacts",
          include: ["last_known_wellness_condition", "urgent_assistance_recommendation"],
        })
      : null;

    return { stageOne, stageTwo, stageThree };
  }

  window.NeuroWellIntegrations = Object.freeze({
    apiStack: API_STACK,
    request,
    generateWellnessInsight,
    analyzeVoice,
    syncWearables,
    runEmergencyProtocol,
  });
})();
