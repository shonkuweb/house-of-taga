import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_CONFIG } from './r2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const mimeMap = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

async function syncPublicAssets() {
  console.log('[Sync] Scanning public/ for images to upload to R2...');
  const files = fs.readdirSync(publicDir);
  const mediaFiles = files.filter(f => /\.(jpg|jpeg|png|svg|webp)$/i.test(f));

  console.log(`[Sync] Found ${mediaFiles.length} media files to sync.`);
  const results = {};

  for (const file of mediaFiles) {
    const ext = path.extname(file).toLowerCase();
    const mime = mimeMap[ext] || 'application/octet-stream';
    const filePath = path.join(publicDir, file);
    const buffer = fs.readFileSync(filePath);
    const key = `house-of-taaga/assets/${file}`;

    try {
      const cmd = new PutObjectCommand({
        Bucket: R2_CONFIG.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mime,
        CacheControl: 'public, max-age=31536000, immutable',
      });
      await r2Client.send(cmd);
      const publicUrl = `${R2_CONFIG.publicUrl}/${key}`;
      results[file] = publicUrl;
      console.log(`✓ Uploaded ${file} -> ${publicUrl}`);
    } catch (err) {
      console.error(`✗ Failed to upload ${file}:`, err.message);
    }
  }

  // Save map of synced assets
  const mapPath = path.join(__dirname, 'data', 'r2_assets_map.json');
  fs.writeFileSync(mapPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`[Sync] Completed. Asset map written to ${mapPath}`);
}

syncPublicAssets();
