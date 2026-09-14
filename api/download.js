export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    const host = req.headers.host || 'localhost';
    const urlObj = new URL(req.url, `https://${host}`);
    const targetUrl = urlObj.searchParams.get('url');
    const filename = urlObj.searchParams.get('filename') || 'Track.mp3';

    if (!targetUrl) {
      return res.status(400).send('Missing target audio URL');
    }

    const audioRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.jiosaavn.com/'
      }
    });

    if (!audioRes.ok) {
      return res.status(audioRes.status).send('Failed to fetch audio stream');
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    const buffer = Buffer.from(await audioRes.arrayBuffer());
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Vercel Download Proxy Error:', error);
    return res.status(500).send('Download Proxy Error');
  }
}
