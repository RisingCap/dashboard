// Vercel serverless proxy → SoSoValue currentEtfDataMetrics
// API key stays server-side via process.env.SOSOVALUE_API_KEY
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const response = await fetch('https://api.sosovalue.xyz/openapi/v2/etf/currentEtfDataMetrics', {
      method: 'POST',
      headers: {
        'x-soso-api-key': process.env.SOSOVALUE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'us-btc-spot' })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ETF metrics' });
  }
}
