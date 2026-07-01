const https = require("https");

function httpsGet(hostname, path) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: "GET",
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
  const q = params.q || "";
  const fields = params.fields || "id,school.name,school.city,school.state";
  const perPage = Math.min(+(params.per_page) || 10, 25);
  const key = process.env.SCORECARD_KEY || "DEMO_KEY";

  if (!q.trim()) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "q param required" }) };
  }

  const qs = new URLSearchParams({
    api_key: key,
    "school.name": q,
    fields,
    per_page: perPage,
  });

  try {
    const r = await httpsGet("api.data.gov", `/ed/collegescorecard/v1/schools?${qs}`);
    return { statusCode: r.status, headers, body: r.body };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: e.message }) };
  }
};
