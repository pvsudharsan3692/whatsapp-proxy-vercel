export default async function handler(req, res) {
  if (req.method === 'GET') {
    const VERIFY_TOKEN = "123456";
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
    const value = body?.entry?.[0]?.changes?.[0]?.value;

    // Ignore message status updates
    if (value?.statuses || !value?.messages) {
      return res.sendStatus(200);
    }

    // Immediately respond to WhatsApp
    res.sendStatus(200);

    // Forward to n8n webhook (don’t wait)
    fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    }).catch(err => console.error("n8n forward error:", err));
  } else {
    res.sendStatus(404);
  }
}
