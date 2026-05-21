import express from "express";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(express.json({ limit: "1mb" }));

const routeDefinitions = [
  {
    path: "/api/ai/chat",
    consent: "ai_wellness",
    provider: "OpenAI API",
    action: "Call OpenAI from the backend with a wellness-safe system prompt.",
  },
  {
    path: "/api/voice/transcribe",
    consent: "voice_analysis",
    provider: "AssemblyAI",
    action: "Upload audio, request transcription, then return text and tone metadata.",
  },
  {
    path: "/api/voice/emotion",
    consent: "voice_analysis",
    provider: "Hume AI",
    action: "Send voice samples for emotion, stress, sadness, anxiety, and fatigue scoring.",
  },
  {
    path: "/api/wearables/google-fit",
    consent: "wearables",
    provider: "Google Fit API",
    action: "Exchange OAuth tokens and sync activity, sleep, steps, and heart rate.",
  },
  {
    path: "/api/wearables/fitbit",
    consent: "wearables",
    provider: "Fitbit Web API",
    action: "Sync sleep, heart-rate, stress, and activity metrics.",
  },
  {
    path: "/api/wearables/healthkit",
    consent: "wearables",
    provider: "Apple HealthKit",
    action: "Receive iOS-authorized health summaries from the mobile client.",
  },
  {
    path: "/api/wearables/human-api",
    consent: "wearables",
    provider: "Human API",
    action: "Aggregate authorized medical and wearable records.",
  },
  {
    path: "/api/medical/infermedica",
    consent: "medical_analysis",
    provider: "Infermedica API",
    action: "Run symptom analysis and preventive risk guidance.",
  },
  {
    path: "/api/emergency/ai-critical-alert",
    consent: "emergency_support",
    provider: "OpenAI API",
    action: "Generate calm grounding, breathing, and seek-support guidance.",
  },
  {
    path: "/api/emergency/support-team",
    consent: "emergency_support",
    provider: "Internal Wellness Team",
    action: "Notify support staff and assigned healthcare professionals before emergency-contact escalation.",
  },
  {
    path: "/api/emergency/twilio",
    consent: "emergency_contacts",
    provider: "Twilio API",
    action: "Send emergency SMS or place calls with critical wellness status and last known condition.",
  },
  {
    path: "/api/notifications/fcm",
    consent: "notifications",
    provider: "Firebase Cloud Messaging",
    action: "Send calm wellness, sleep, medication, or stress reminders.",
  },
  {
    path: "/api/emergency/nearby-care",
    consent: "location",
    provider: "Google Maps Platform",
    action: "Find nearby hospitals, emergency centers, and assistance routes.",
  },
];

function requireAuth(request, response, next) {
  if (!request.get("authorization")) {
    return response.status(401).json({
      error: "Authentication required",
      recovery: "Send a valid bearer token from Firebase Auth, Supabase Auth, or your chosen identity provider.",
    });
  }

  return next();
}

function requireConsent(scope) {
  return (request, response, next) => {
    const consentScopes = request.body?.consent || [];
    if (!Array.isArray(consentScopes) || !consentScopes.includes(scope)) {
      return response.status(403).json({
        error: `Consent required for ${scope}`,
        recovery: "Ask the user for explicit consent before accessing sensitive wellness data.",
      });
    }

    return next();
  };
}

function createPlaceholderHandler({ provider, action }) {
  return (request, response) => {
    response.json({
      provider,
      action,
      status: "not_implemented",
      receivedAt: new Date().toISOString(),
      input: request.body,
    });
  };
}

app.get("/health", (_request, response) => {
  response.json({
    service: "NeuroWell AI API Gateway",
    status: "ok",
    routes: routeDefinitions.length,
  });
});

routeDefinitions.forEach((definition) => {
  app.post(
    definition.path,
    requireAuth,
    requireConsent(definition.consent),
    createPlaceholderHandler(definition),
  );
});

app.use((request, response) => {
  response.status(404).json({
    error: "Route not found",
    path: request.path,
  });
});

app.use((error, _request, response, _next) => {
  response.status(500).json({
    error: "Unexpected server error",
    detail: error instanceof Error ? error.message : "Unknown error",
  });
});

app.listen(port, () => {
  console.log(`NeuroWell AI API gateway listening on ${port}`);
});
