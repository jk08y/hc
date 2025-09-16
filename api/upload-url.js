// Path: api/upload-url.js
import { getR2 } from './r2-storage';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { key, contentType } = req.body;

  if (!key || !contentType) {
    console.error('API Error: Missing key or contentType in request body.');
    return res.status(400).json({ success: false, error: 'Missing key or contentType' });
  }

  try {
    const r2 = getR2();
    if (!r2) {
      console.error('API Error: R2 client not initialized. Check environment variables.');
      return res.status(500).json({ success: false, error: 'Server configuration error. Check Vercel logs.' });
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    
    // Set a short expiry time for security
    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    res.status(200).json({ success: true, url: signedUrl });
  } catch (err) {
    console.error('API Error generating upload URL:', err);
    res.status(500).json({ success: false, error: 'Failed to generate upload URL. Check Vercel logs.' });
  }
}
