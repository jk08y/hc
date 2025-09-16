// Path: api/delete-file.js
import { getR2 } from './r2-storage';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { key } = req.body;

  if (!key) {
    console.error('API Error: Missing key in request body for deletion.');
    return res.status(400).json({ success: false, error: 'Missing key' });
  }
  
  try {
    const r2 = getR2();
    if (!r2) {
      console.error('API Error: R2 client not initialized. Check environment variables.');
      return res.status(500).json({ success: false, error: 'Server configuration error. Check Vercel logs.' });
    }

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2.send(command);

    res.status(200).json({ success: true, message: 'File deleted successfully' });
  } catch (err) {
    console.error('API Error deleting file:', err);
    res.status(500).json({ success: false, error: 'Failed to delete file. Check Vercel logs.' });
  }
}
