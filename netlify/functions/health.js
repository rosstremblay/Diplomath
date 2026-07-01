exports.handler = async () => ({
  statusCode: 200,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify({ ok: true, scorecard: process.env.SCORECARD_KEY ? "set" : "not set" }),
});
