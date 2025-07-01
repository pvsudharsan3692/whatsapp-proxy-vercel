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

  // Ignore message statuses
  if (message?.statuses) {
    return res.sendStatus(200);
  }

  // Avoid duplicates (optional logic)
  if (!message?.messages) {
    return res.sendStatus(200); // no message, ignore
  }

  try {
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("n8n webhook error:", await response.text());
      return res.sendStatus(500); // force WhatsApp retry
    }

    return res.sendStatus(200); // ✅ tell WhatsApp we're done

  } catch (err) {
    console.error("Fetch to n8n failed:", err);
    return res.sendStatus(500); // ❌ WhatsApp may retry
  }
}
