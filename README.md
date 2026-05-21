# NeuroWell AI

NeuroWell AI is a futuristic healthcare and wellness dashboard focused on proactive mental and physical health monitoring, emotionally safe AI support, wearable data, and emergency escalation.

## Features

- Clean white and light-blue glassmorphism dashboard
- Dark mode with deep navy surfaces and cyan accents
- Focused tabs for Home, Mental Health, Physical Health, Sleep, AI Insights, Reports, Emergency Help, and Settings
- Traffic-light wellness status system
- Below-30 emergency monitoring workflow
- Floating AI wellness companion
- API integration registry for the MVP healthcare stack
- Node/Express API gateway example for secure backend integration

## MVP API Stack

- OpenAI API for AI chat, summaries, recommendations, and multilingual support
- Hume AI for emotional and voice analysis
- AssemblyAI for speech-to-text and voice sentiment
- Firebase and Firebase Cloud Messaging for auth, storage, analytics, and notifications
- Google Fit, Fitbit, Apple HealthKit, and Human API for wearable data
- Infermedica for symptom and risk analysis
- Twilio for emergency SMS and calls
- Google Maps Platform for nearby emergency care
- Supabase as an optional PostgreSQL backend
- Chart.js-ready dependency for production analytics charts

## Local Development

```bash
npm install
npm run check
npm run dev
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

## Backend Gateway

`server.example.js` contains secure route placeholders for production API calls. Keep vendor secrets on the backend and copy `.env.example` to `.env` when you are ready to wire real credentials.

```bash
npm run api
```

## Vercel Deployment

This project includes `vercel.json` and a `build` script. In Vercel:

- Import the GitHub repository.
- Keep the framework preset as `Other`.
- Use `npm run build` as the build command.
- Leave output directory as `.`.
- Add environment variables from `.env.example` only when backend/API routes are implemented.

The current frontend is static and can deploy immediately. Production API calls should be moved into Vercel serverless functions or a separate Node/Express service before using real healthcare or emergency data.

## Deployment Health Check

After deploying to Vercel, verify the serverless runtime:

```text
/api/health
```
