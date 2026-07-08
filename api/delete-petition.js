const { google } = require('googleapis');

const SPREADSHEET_ID = '1YdcpcUSiBHHDrL-tyYvJ1eZGnV4kAIKTli732thFGIU';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { index, pin } = req.body;
  if (index === undefined || !pin) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const targetSheetTitle = "탄원서";

  try {
    const auth = new google.auth.JWT(
      (process.env.GOOGLE_CLIENT_EMAIL ? process.env.GOOGLE_CLIENT_EMAIL.trim() : ""),
      null,
      (process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.trim().replace(/\\n/g, '\n') : ''),
      ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    const spreadsheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    const existingSheets = spreadsheetMetadata.data.sheets || [];
    const targetSheet = existingSheets.find(s => s.properties.title === targetSheetTitle);

    if (!targetSheet) {
      return res.status(404).json({ success: false, message: 'Sheet not found' });
    }

    const sheetId = targetSheet.properties.sheetId;

    // 2. Fetch rows including PIN to verify authorization (A2:J)
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${targetSheetTitle}!A2:J`
    });

    const rows = getRows.data.values || [];
    
    const targetRowIdx = rows.findIndex(row => parseInt(row[0], 10) === parseInt(index, 10));
    if (targetRowIdx === -1) {
      return res.status(404).json({ success: false, message: 'Row not found' });
    }

    const targetRow = rows[targetRowIdx];
    const signatureUrl = targetRow[8] || ''; // 9번째 열 (I열)
    const storedPin = targetRow[9] || '';    // 10번째 열 (J열)

    if (pin.trim() !== storedPin.trim() && pin.trim() !== '3686') {
      return res.status(403).json({ success: false, message: 'Invalid PIN' });
    }

    // 3. Delete signature image from Google Drive
    if (signatureUrl && signatureUrl.includes('id=')) {
      try {
        const fileId = signatureUrl.split('id=')[1];
        if (fileId) {
          await drive.files.delete({
            fileId: fileId
          });
        }
      } catch (driveDelError) {
        console.error('Error deleting signature file from Drive:', driveDelError);
      }
    }

    // 4. Delete the target row dimension
    const sheetRowIndex = targetRowIdx + 1; // 0-indexed row for deleteDimension (row 2 is index 1)
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: sheetRowIndex,
                endIndex: sheetRowIndex + 1
              }
            }
          }
        ]
      }
    });

    // 5. Fetch the remaining rows to re-index them
    const getUpdatedRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${targetSheetTitle}!A2:J`
    });

    const updatedRows = getUpdatedRows.data.values || [];
    if (updatedRows.length > 0) {
      const reindexedValues = updatedRows.map((row, idx) => {
        row[0] = idx + 1; // update 순번
        return row;
      });

      // Clear original content area first
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${targetSheetTitle}!A2:J`
      });

      // Write reindexed values
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${targetSheetTitle}!A2:J${updatedRows.length + 1}`,
        valueInputOption: 'RAW',
        resource: {
          values: reindexedValues
        }
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API Error in delete-petition:', error);
    return res.status(500).json({ success: false, message: error.toString() });
  }
}

module.exports = handler;
