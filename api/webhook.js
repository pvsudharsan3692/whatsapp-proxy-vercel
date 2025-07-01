export default async function handler(req, res) {
  // For verification (GET method)
  if (req.method === 'GET') {
    const VERIFY_TOKEN = "123456";
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }

  // For incoming messages (POST method)
  if (req.method === 'POST') {
    const body = req.body;

    // Check if it's a user message (not status update)
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    // If it's a real message (not a status or repeated delivery)
    if (message && message.type) {
      // Optional: Add deduplication logic using message ID or timestamp

      // Forward to n8n
      const fetch = (await import('node-fetch')).default;
      await fetch("https://pvautomationsolutions.app.n8n.cloud/webhook/cdfbc827-d1f0-40f1-84ed-f63d05b6f595", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    }

    // Always respond to Meta quickly
    return res.sendStatus(200);
  }

  // Method not allowed
  return res.sendStatus(405);
}

