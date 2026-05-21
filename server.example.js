import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));

const requireAuth = (request, response, next) => {
  const authHeader = request.get("authorization");
  if (!authHeader) return response.status(401).json({ error: "Authentication required" });
  next();
};

const consentGate = (scope) => (request, response, next) => {
  if (!request.body?.consent?.includes(scope)) {
    return response.status(403).json({ error: `Consent required for ${scope}` });
  }
  next();
};

app.post("/api/ai/chat", requireAuth, consentGate("ai_wellness"), async (request, response) => {
  response.json({
    provider: "OpenAI API",
    nextStep: "Call OpenAI Responses API from this backend route with a wellness-safe system prompt.",
    input: request.body,
  });
});

app.post("/api/voice/transcribe", requireAuth, consentGate("voice_analysis"), async (request, response) => {
  response.json({
    provider: "AssemblyAI",
    nextStep: "Upload audio, request transcription, then return text and tone metadata.",
  });
});

app.post("/api/voice/emotion", requireAuth, consentGate("voice_analysis"), async (request, response) => {
  response.json({
    provider: "Hume AI",
    nextStep: "Send voice sample for emotion, stress, sadness, anxiety, and fatigue scoring.",
  });
});

app.post("/api/wearables/google-fit", requireAuth, consentGate("wearables"), async (request, response) => {
  response.json({ provider: "Google Fit API", nextStep: "Exchange OAuth token and sync activity, sleep, steps, and heart rate." });
});

app.post("/api/wearables/fitbit", requireAuth, consentGate("wearables"), async (request, response) => {
  response.json({ provider: "Fitbit Web API", nextStep: "Sync sleep, heart-rate, stress, and activity metrics." });
});

app.post("/api/wearables/healthkit", requireAuth, consentGate("wearables"), async (request, response) => {
  response.json({ provider: "Apple HealthKit", nextStep: "Receive iOS-authorized health summaries from the mobile client." });
});

app.post("/api/wearables/human-api", requireAuth, consentGate("wearables"), async (request, response) => {
  response.json({ provider: "Human API", nextStep: "Aggregate authorized medical and wearable records." });
});

app.post("/api/medical/infermedica", requireAuth, consentGate("medical_analysis"), async (request, response) => {
  response.json({ provider: "Infermedica API", nextStep: "Run symptom analysis and preventive risk guidance." });
});

app.post("/api/emergency/support-team", requireAuth, consentGate("emergency_support"), async (request, response) => {
  response.json({
    provider: "Internal Wellness Team",
    action: "Notify support staff and assigned healthcare professionals before emergency-contact escalation.",
  });
});

app.post("/api/emergency/twilio", requireAuth, consentGate("emergency_contacts"), async (request, response) => {
  response.json({
    provider: "Twilio API",
    action: "Send emergency SMS or place calls with critical wellness status and last known condition.",
  });
});

app.post("/api/notifications/fcm", requireAuth, consentGate("notifications"), async (request, response) => {
  response.json({ provider: "Firebase Cloud Messaging", action: "Send calm wellness, sleep, medication, or stress reminder." });
});

app.post("/api/emergency/nearby-care", requireAuth, consentGate("location"), async (request, response) => {
  response.json({ provider: "Google Maps Platform", action: "Find nearby hospitals, emergency centers, and assistance routes." });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`NeuroWell AI API gateway listening on ${process.env.PORT || 4000}`);
});
