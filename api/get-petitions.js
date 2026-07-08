const { google } = require('googleapis');

const SPREADSHEET_ID = '1uO9wHuO9c629s54pCfExWHUVdeB-wj1d71p1hRlYkQU';

async function handler(req, res) {
  const targetSheetTitle = "탄원서";

  try {
    const auth = new google.auth.JWT(
      (process.env.GOOGLE_CLIENT_EMAIL ? process.env.GOOGLE_CLIENT_EMAIL.trim() : ""),
      null,
      (process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.trim().replace(/\\n/g, '\n') : ''),
      ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Fetch spreadsheet metadata to check if the target sheet exists
    const spreadsheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    const existingSheets = spreadsheetMetadata.data.sheets || [];
    const targetSheet = existingSheets.find(s => s.properties.title === targetSheetTitle);

    if (!targetSheet) {
      return res.status(200).json({ success: true, roster: [] });
    }

    // 2. Fetch rows (excluding the PIN in column J for security, fetch A2:I)
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${targetSheetTitle}!A2:I`
    });

    const rows = getRows.data.values || [];
    const roster = rows.map((row, idx) => ({
      index: row[0] ? parseInt(row[0], 10) : (idx + 1),
      name: row[1] || '',
      address: row[2] || '',
      userType: row[3] || '구분소유자',
      phone: row[4] || '',
      ip: row[5] || '',
      device: row[6] || '',
      timestamp: row[7] || '',
      signatureImg: row[8] || ''
    }));

    return res.status(200).json({ success: true, roster });
  } catch (error) {
    console.error('API Error in get-petitions:', error);
    return res.status(500).json({ success: false, message: error.toString() });
  }
}

module.exports = handler;
