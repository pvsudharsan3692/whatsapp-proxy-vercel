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
  const value = body?.entry?.[0]?.changes?.[0]?.value;

  // Ignore message status updates
  if (value?.statuses) return res.sendStatus(200);
  if (!value?.messages) return res.sendStatus(200);

  // Forward to n8n — but don't wait
  fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(err => console.error("n8n forwarding failed:", err));

  // Respond immediately
  return res.sendStatus(200);
}
