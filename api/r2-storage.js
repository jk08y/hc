// Path: api/r2-storage.js
import { S3Client } from '@aws-sdk/client-s3';

const ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

let r2Client;

export const getR2 = () => {
  if (!ACCOUNT_ID) {
    console.error('CRITICAL: CLOUDFLARE_R2_ACCOUNT_ID is missing.');
    return null;
  }
  if (!ACCESS_KEY_ID) {
    console.error('CRITICAL: CLOUDFLARE_R2_ACCESS_KEY_ID is missing.');
    return null;
  }
  if (!SECRET_ACCESS_KEY) {
    console.error('CRITICAL: CLOUDFLARE_R2_SECRET_ACCESS_KEY is missing.');
    return null;
  }
  if (!BUCKET_NAME) {
    console.error('CRITICAL: CLOUDFLARE_R2_BUCKET_NAME is missing.');
    return null;
  }
  
  if (r2Client) {
    return r2Client;
  }

  const endpoint = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;
  
  try {
    r2Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
      },
    });
    console.log('R2 client initialized successfully.');
    return r2Client;
  } catch (err) {
    console.error('Failed to initialize R2 S3Client:', err);
    return null;
  }
};
