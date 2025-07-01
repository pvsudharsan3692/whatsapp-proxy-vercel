export default async function handler(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return new Response("Forbidden", { status: 403 });
    }
  }

  if (req.method === 'POST') {
    const body = req.body;
    const message = body?.entry?.[0]?.changes?.[0]?.value;

    if (message?.statuses) {
      return new Response(null, { status: 200 });
    }

    try {
      const forwardTo = process.env.N8N_WEBHOOK_URL;
      await fetch(forwardTo, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return new Response(null, { status: 200 });
    } catch (err) {
      console.error("Error forwarding to n8n:", err);
      return new Response("Error", { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}
