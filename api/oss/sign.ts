import OSS from 'ali-oss';

interface Body {
  action: 'upload' | 'view';
  filename?: string;
  contentType?: string;
  objectKey?: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    OSS_REGION,
    OSS_BUCKET,
    OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET,
    OSS_UPLOAD_PREFIX = 'trades',
    OSS_SIGN_EXPIRES = '600',
  } = process.env;

  if (!OSS_REGION || !OSS_BUCKET || !OSS_ACCESS_KEY_ID || !OSS_ACCESS_KEY_SECRET) {
    return res.status(500).json({ error: 'Missing OSS server env configuration' });
  }

  const client = new OSS({
    region: OSS_REGION,
    bucket: OSS_BUCKET,
    accessKeyId: OSS_ACCESS_KEY_ID,
    accessKeySecret: OSS_ACCESS_KEY_SECRET,
  });

  const body: Body = req.body || {};
  const expires = Number(OSS_SIGN_EXPIRES) || 600;

  if (body.action === 'upload') {
    const ext = (body.filename || 'image.png').split('.').pop() || 'png';
    const objectKey = `${OSS_UPLOAD_PREFIX}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
    const uploadUrl = client.signatureUrl(objectKey, {
      method: 'PUT',
      expires,
      'Content-Type': body.contentType || 'application/octet-stream',
    });
    return res.status(200).json({ uploadUrl, objectKey });
  }

  if (body.action === 'view' && body.objectKey) {
    const viewUrl = client.signatureUrl(body.objectKey, { method: 'GET', expires });
    return res.status(200).json({ viewUrl });
  }

  return res.status(400).json({ error: 'Invalid payload' });
}
