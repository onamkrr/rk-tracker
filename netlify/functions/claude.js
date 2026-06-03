exports.handler = async (event) => {
  const h = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: h, body: "" };
  try {
    const { prompt, system, imageBase64, imageType } = JSON.parse(event.body || "{}");
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { statusCode: 500, headers: h, body: JSON.stringify({ error: "API key not configured" }) };
    const content = [];
    if (imageBase64) content.push({ type: "image", source: { type: "base64", media_type: imageType || "image/jpeg", data: imageBase64 } });
    content.push({ type: "text", text: prompt });
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1000, system: system || "You are a helpful assistant for Onam Agarbathi Pvt. Ltd.", messages: [{ role: "user", content }] })
    });
    const d = await r.json();
    if (d.error) return { statusCode: 500, headers: h, body: JSON.stringify({ error: d.error.message }) };
    return { statusCode: 200, headers: h, body: JSON.stringify({ text: d.content?.[0]?.text || "" }) };
  } catch (e) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: e.message }) };
  }
};
