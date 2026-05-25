// Before ❌
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ model: "claude-3-sonnet-20240229", max_tokens: 1024 }),
});