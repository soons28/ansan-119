import { createClient } from '@supabase/supabase-js';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function dataUrlToBuffer(dataUrl) {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl || '');
  if (!match) return null;
  const mime = match[1];
  const base64 = match[2];
  const buf = Buffer.from(base64, 'base64');
  return { mime, buf };
}

function extFromMime(mime) {
  const m = (mime || '').toLowerCase();
  if (m === 'image/png') return 'png';
  if (m === 'image/webp') return 'webp';
  if (m === 'image/gif') return 'gif';
  return 'jpg';
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_IMAGES_BUCKET || 'images';

  if (!url || !serviceKey) {
    return json(res, 500, { error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
  }

  try {
    const body = await readJson(req);
    const dataUrl = body?.dataUrl;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return json(res, 400, { error: 'Missing dataUrl' });
    }

    const parsed = dataUrlToBuffer(dataUrl);
    if (!parsed) return json(res, 400, { error: 'Invalid dataUrl' });

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // Ensure bucket exists (idempotent best-effort)
    const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket(bucket);
    if (getBucketError && getBucketError.statusCode === '404') {
      const { error: createBucketError } = await supabase.storage.createBucket(bucket, { public: true });
      if (createBucketError) {
        return json(res, 500, { error: 'Bucket create failed', details: createBucketError.message });
      }
    } else if (getBucketError) {
      return json(res, 500, { error: 'Bucket lookup failed', details: getBucketError.message });
    } else if (existingBucket && existingBucket.public === false) {
      // Don't force toggle; just warn in response if images still 403 on read.
    }

    const ext = extFromMime(parsed.mime);
    const objectName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectName, parsed.buf, { contentType: parsed.mime, upsert: true });

    if (uploadError) {
      return json(res, 500, { error: 'Upload failed', details: uploadError.message });
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(objectName);
    return json(res, 200, { publicUrl: publicUrlData.publicUrl, objectName });
  } catch (e) {
    return json(res, 500, { error: 'Server error', details: String(e?.message || e) });
  }
}

