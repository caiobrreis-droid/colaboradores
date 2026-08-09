import 'server-only';

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

function bucketConfig() {
  const bucket = process.env.BUCKET;
  const endpoint = process.env.ENDPOINT;
  const accessKeyId = process.env.ACCESS_KEY_ID;
  const secretAccessKey = process.env.SECRET_ACCESS_KEY;

  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) return null;
  return { bucket, endpoint, accessKeyId, secretAccessKey };
}

export function isBucketConfigured() {
  return Boolean(bucketConfig());
}

function getClient() {
  const config = bucketConfig();
  if (!config) throw new Error('Railway Storage Bucket não configurado.');

  return {
    bucket: config.bucket,
    client: new S3Client({
      region: process.env.REGION || 'auto',
      endpoint: config.endpoint,
      forcePathStyle: false,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  };
}

function extensionFromMimeType(mimeType: string) {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return extensions[mimeType] || 'bin';
}

export async function storeDataUrl(dataUrl: string, folder: 'profiles' | 'employees', ownerId: string) {
  const match = /^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;

  const [, contentType, base64] = match;
  const body = Buffer.from(base64, 'base64');
  if (body.length > 5 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 5 MB.');

  const { client, bucket } = getClient();
  const key = `${folder}/${ownerId}/${Date.now()}.${extensionFromMimeType(contentType)}`;
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'private, max-age=3600',
  }));
  return key;
}

export async function getStoredFile(key: string) {
  const { client, bucket } = getClient();
  return client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
}

export async function deleteStoredFile(key?: string | null) {
  if (!key || !isBucketConfigured()) return;
  const { client, bucket } = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
