const { google } = require('googleapis');

const SPREADSHEET_ID = '15hUBBN8mKwY0g00b6cKb01SVCeLRhXxzHKIqq3DhZu0';

async function handler(req, res) {
  const targetSheetTitle = "법원제출탄원서";

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

    // 2. Fetch rows (excluding the PIN in column J/row[9] for security, fetch A2:L)
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${targetSheetTitle}!A2:L`
    });

    const rows = getRows.data.values || [];
    const roster = rows.map((row, idx) => {
      let rawImg = '';
      if (row && row.length > 8 && row[8]) {
        rawImg = String(row[8]).trim();
      }
      
      let rawBase64 = '';
      if (row && row.length > 11 && row[11]) {
        rawBase64 = String(row[11]).trim();
      }

      return {
        index: (row && row[0]) ? parseInt(row[0], 10) : (idx + 1),
        name: (row && row[1]) ? String(row[1]).trim() : '',
        address: (row && row[2]) ? String(row[2]).trim() : '',
        userType: (row && row[3]) ? String(row[3]).trim() : '구분소유자',
        phone: (row && row[4]) ? String(row[4]).trim() : '',
        ip: (row && row[5]) ? String(row[5]).trim() : '',
        device: (row && row[6]) ? String(row[6]).trim() : '',
        timestamp: (row && row[7]) ? String(row[7]).trim() : '',
        signatureImg: rawImg,
        signatureBase64: rawBase64
      };
    });

    return res.status(200).json({ success: true, roster });
  } catch (error) {
    console.error('API Error in get-petition-court:', error);
    return res.status(500).json({ success: false, message: error.toString() });
  }
}

module.exports = handler;
