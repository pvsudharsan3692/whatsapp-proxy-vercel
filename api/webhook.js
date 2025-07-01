export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode && token === "123456") {
      return new Response(challenge, { status: 200 });
    } else {
      return new Response("Forbidden", { status: 403 });
    }
  }

  if (req.method === 'POST') {
    const body = await req.json();
    console.log("Received:", body);

    // ✅ Send only actual user messages to n8n webhook
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {
      const webhookUrl = 'https://your-n8n-url.com/webhook-path'; // Replace with actual n8n webhook
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    return new Response(null, { status: 200 });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
