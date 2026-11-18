import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

// Cloudflare R2 Configuration with provided credentials
export const R2_CONFIG = {
  accountId: process.env.R2_ACCOUNT_ID || 'd098e896b8f7dc0403ad3a16f592dfe6',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || 'f95b6dce449f4bb721ce54aa3b2f4e2b',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '401cb76e46f0f908fcd78b5b2fbd75e92a4bbc1d26adbffbb3c37ef14fcc2ca1',
  bucketName: process.env.R2_BUCKET_NAME || 'chf-media',
  publicUrl: (process.env.R2_PUBLIC_URL || 'https://pub-ce8688bc6c654bcfb99716f7c9373bcd.r2.dev').replace(/\/+$/, '')
};

// Initialize S3 Client for Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
  forcePathStyle: true,
});

/**
 * Uploads a buffer or stream to Cloudflare R2 and returns its public URL
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File mimetype (e.g. image/jpeg)
 * @param {string} folder - Folder prefix in the bucket
 * @returns {Promise<{ url: string, key: string, bucket: string }>}
 */
export async function uploadToR2(buffer, originalName = 'image.jpg', mimeType = 'image/jpeg', folder = 'house-of-taaga/uploads') {
  const ext = path.extname(originalName) || '.jpg';
  const sanitizedBase = path.basename(originalName, ext).toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 40) || 'media';
  const uniqueKey = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e6)}-${sanitizedBase}${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_CONFIG.bucketName,
    Key: uniqueKey,
    Body: buffer,
    ContentType: mimeType,
    // Add cache-control for performance
    CacheControl: 'public, max-age=31536000, immutable',
  });

  await r2Client.send(command);

  const publicUrl = `${R2_CONFIG.publicUrl}/${uniqueKey}`;
  console.log(`[R2] Successfully uploaded to: ${publicUrl}`);

  return {
    url: publicUrl,
    key: uniqueKey,
    bucket: R2_CONFIG.bucketName,
  };
}
