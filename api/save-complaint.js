const { google } = require('googleapis');

const SPREADSHEET_ID = '1uO9wHuO9c629s54pCfExWHUVdeB-wj1d71p1hRlYkQU';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { name, address, signatureImg, pin, currentMode } = req.body;
  if (!name || !address || !pin || !currentMode) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const auth = new google.auth.JWT(
      (process.env.GOOGLE_CLIENT_EMAIL ? process.env.GOOGLE_CLIENT_EMAIL.trim() : ""),
      null,
      (process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.trim().replace(/\\n/g, '\n') : ''),
      ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });
    const targetSheetTitle = currentMode === 'ground' ? "지상" : "지하";

    // 1. Check if the spreadsheet has the target sheet (tab)
    const spreadsheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    const existingSheets = spreadsheetMetadata.data.sheets || [];
    const targetSheet = existingSheets.find(s => s.properties.title === targetSheetTitle);

    if (!targetSheet) {
      // Create the sheet (tab) dynamically
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: targetSheetTitle
                }
              }
            }
          ]
        }
      });

      // Write header row
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${targetSheetTitle}!A1:H1`,
        valueInputOption: 'RAW',
        resource: {
          values: [['순번', '성명', '동호수', 'IP 주소', '접속 기기', '서명 일시', '서명 이미지 URL', 'PIN']]
        }
      });
    }

    // 2. Get current rows to calculate index
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${targetSheetTitle}!A:A`
    });
    
    const rows = getRows.data.values || [];
    const nextIndex = rows.length; // since A1 is the header, rows.length will be 1 initially, making the next item index 1

    const now = new Date();
    // Offset to KST (UTC+9)
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    const timestampStr = kstDate.toISOString().replace('T', ' ').substring(0, 19);

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
    const clientDevice = req.headers['user-agent'] || 'Unknown Device';
    const signatureUrl = signatureImg || '';

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${targetSheetTitle}!A2`,
      valueInputOption: 'RAW',
      resource: {
        values: [[nextIndex, name.trim(), address.trim(), clientIp, clientDevice, timestampStr, signatureUrl, pin.trim()]]
      }
    });

    return res.status(200).json({ success: true, index: nextIndex });
  } catch (error) {
    console.error('API Error in save-complaint:', error);
    return res.status(500).json({ success: false, message: error.toString() });
  }
}

module.exports = handler;
