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

    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (message && message.type) {
      const fetch = (await import('node-fetch')).default;
      await fetch("https://pvautomationsolutions.app.n8n.cloud/webhook/cdfbc827-dff0-40f1-84ed-f63d05b6f595", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    }

    return res.sendStatus(200);
  }

  return res.sendStatus(405);
}

