# Security Notes

NeuroWell AI is designed for sensitive wellness data, so production integrations must keep all vendor secrets and health records on trusted backend infrastructure.

## Required Production Controls

- Never expose API keys in browser code.
- Require authentication before calling API routes.
- Ask for explicit consent before accessing voice, wearable, medical, emergency, or location data.
- Encrypt sensitive records at rest and in transit.
- Keep audit logs for emergency escalations and data-sharing events.
- Use human review before escalating emergency contacts unless the user is unresponsive or severe danger indicators are present.
- Treat AI output as supportive wellness guidance, not diagnosis.

## Environment Variables

Use `.env.example` as the reference list. Store real values in Vercel Environment Variables or a secure backend secret manager.
