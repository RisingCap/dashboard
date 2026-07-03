// Vercel serverless proxy → Twelve Data daily history for MSTR + STRC.
// Key stays server-side via process.env.TWELVEDATA_API_KEY.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Daily candles change once a day — cache 30 min at the edge.
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
  try {
    const key = process.env.TWELVEDATA_API_KEY;
    if (!key) return res.status(500).json({ error: 'missing TWELVEDATA_API_KEY' });
    const r = await fetch(`https://api.twelvedata.com/time_series?symbol=MSTR,STRC&interval=1day&outputsize=160&apikey=${key}`);
    const data = await r.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch MSTR/STRC history' });
  }
}
