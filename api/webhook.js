export default async function handler(req, res) {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  if (req.method === 'GET') {
    // Webhook Verification by Meta
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

    // Ignore status messages
    if (message?.statuses) {
      console.log('Skipping status message');
      return res.sendStatus(200);
    }

    // Forward only valid messages to n8n webhook
    try {
      await fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      return res.sendStatus(200);
    } catch (err) {
      console.error('Error forwarding:', err);
      return res.sendStatus(500);
    }
  }

  return res.sendStatus(405);
}
