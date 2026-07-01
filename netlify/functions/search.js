const https = require("https");

function httpsGet(hostname, path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname, path, method: "GET",
      headers: { "User-Agent": "Diplomath/1.0" }
    }, res => {
      let body = "";
      res.on("data", d => body += d);
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    req.end();
  });
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const params = event.queryStringParameters || {};
  const q = (params.q || "").trim();
  const fields = params.fields || "id,school.name,school.city,school.state";
  const perPage = Math.min(+(params.per_page) || 10, 25);
  const key = process.env.SCORECARD_KEY || "DEMO_KEY";

  if (!q) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "q param required" }) };
  }

  // Build query string manually to avoid any encoding issues
  const qs = `api_key=${encodeURIComponent(key)}&school.name=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&per_page=${perPage}`;
  const path = `/ed/collegescorecard/v1/schools?${qs}`;

  try {
    const r = await httpsGet("api.data.gov", path);

    // Check if response is actually JSON before returning
    const trimmed = r.body.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      // Got HTML or plain text error — wrap it
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: `Upstream error (${r.status}): ${trimmed.slice(0, 200)}` })
      };
    }

    return { statusCode: r.status, headers, body: r.body };
  } catch (e) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: e.message })
    };
  }
};
