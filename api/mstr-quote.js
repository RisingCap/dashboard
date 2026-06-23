// Vercel serverless proxy → Twelve Data realtime quote for MSTR + STRC.
// Key stays server-side via process.env.TWELVEDATA_API_KEY.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const key = process.env.TWELVEDATA_API_KEY;
    if (!key) return res.status(500).json({ error: 'missing TWELVEDATA_API_KEY' });
    const r = await fetch(`https://api.twelvedata.com/quote?symbol=MSTR,STRC&apikey=${key}`);
    const data = await r.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch MSTR/STRC quote' });
  }
}
