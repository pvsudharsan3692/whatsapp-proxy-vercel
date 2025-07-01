export default async function handler(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }

  if (req.method === 'POST') {
    const body = req.body;
    const message = body?.entry?.[0]?.changes?.[0]?.value;

    // Ignore template status updates
    if (message?.statuses) {
      console.log("Skipping status update");
      return res.sendStatus(200);
    }

    // Forward valid messages to n8n webhook
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL;
      const result = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      return res.sendStatus(result.status);
    } catch (err) {
      console.error("Error forwarding to n8n:", err);
      return res.sendStatus(500);
    }
  }

  return res.sendStatus(405);
}
