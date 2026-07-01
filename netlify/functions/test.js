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

exports.handler = async () => {
  const key = process.env.SCORECARD_KEY || "DEMO_KEY";
  const path = `/ed/collegescorecard/v1/schools?api_key=${key}&school.name=MIT&fields=id,school.name&per_page=1`;

  try {
    const r = await httpsGet("api.data.gov", path);
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" },
      body: `Key in use: ${key === "DEMO_KEY" ? "DEMO_KEY (rate-limited — set SCORECARD_KEY in Netlify env vars)" : key.slice(0,8)+"..."}\nAPI status: ${r.status}\nResponse: ${r.body.slice(0,300)}`
    };
  } catch(e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: `Error: ${e.message}`
    };
  }
};
