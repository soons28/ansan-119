const { google } = require('googleapis');

async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('Missing file id');
  }

  try {
    const auth = new google.auth.JWT(
      (process.env.GOOGLE_CLIENT_EMAIL ? process.env.GOOGLE_CLIENT_EMAIL.trim() : ""),
      null,
      (process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.trim().replace(/\\n/g, '\n') : ''),
      ['https://www.googleapis.com/auth/drive']
    );

    const drive = google.drive({ version: 'v3', auth });

    // Download the file stream from Google Drive directly (authorized server-to-server)
    const driveRes = await drive.files.get(
      { fileId: id, alt: 'media' },
      { responseType: 'stream' }
    );

    // Forward headers & stream response
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    driveRes.data.pipe(res);
  } catch (error) {
    console.error('Error proxying signature image:', error);
    res.status(500).send('Error loading image');
  }
}

module.exports = handler;
