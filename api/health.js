const responseHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

export default function handler(_request, response) {
  response.writeHead(200, responseHeaders);
  response.end(
    JSON.stringify({
      service: "NeuroWell AI",
      status: "ok",
      runtime: "vercel-serverless",
      checkedAt: new Date().toISOString(),
    }),
  );
}
