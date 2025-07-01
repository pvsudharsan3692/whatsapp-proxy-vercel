export const config = {
  runtime: 'edge', // Required for Vercel Edge Functions
};

export default async function handler(req) {
  const { method, url } = req;

  if (method === 'GET') {
    const { searchParams } = new URL(url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === 'subscribe' && token === "123456") {
      return new Response(challenge, { status: 200 });
    } else {
      return new Response("Forbidden", { status: 403 });
    }
  }

  if (method === 'POST') {
    const body = await req.json();
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (message && message.type) {
      try {
        await fetch("https://pvautomationsolutions.app.n8n.cloud/webhook/cdfbc827-dff0-40f1-84ed-f63d05b6f595", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      } catch (err) {
        console.error("Failed to forward to n8n:", err);
        return new Response("n8n error", { status: 500 });
      }
    }

    return new Response("OK", { status: 200 });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
