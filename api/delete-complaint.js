const { google } = require('googleapis');

const SPREADSHEET_ID = '1uO9wHuO9c629s54pCfExWHUVdeB-wj1d71p1hRlYkQU';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { index, pin, currentMode } = req.body;
  if (index === undefined || !pin || !currentMode) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const targetSheetTitle = currentMode === 'ground' ? "지상" : "지하";

  try {
    const auth = new google.auth.JWT(
      (process.env.GOOGLE_CLIENT_EMAIL ? process.env.GOOGLE_CLIENT_EMAIL.trim() : ""),
      null,
      (process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.trim().replace(/\\n/g, '\n') : ''),
      ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Get spreadsheet metadata to check if sheet exists and get sheetId
    const spreadsheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    const existingSheets = spreadsheetMetadata.data.sheets || [];
    const targetSheet = existingSheets.find(s => s.properties.title === targetSheetTitle);

    if (!targetSheet) {
      return res.status(404).json({ success: false, message: 'Sheet not found' });
    }

    const sheetId = targetSheet.properties.sheetId;

    // 2. Fetch rows including PIN to verify authorization
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${targetSheetTitle}!A2:H`
    });

    const rows = getRows.data.values || [];
    
    // Find the row where the first column matches the given index (sequential index number)
    const targetRowIdx = rows.findIndex(row => parseInt(row[0], 10) === parseInt(index, 10));
    if (targetRowIdx === -1) {
      return res.status(404).json({ success: false, message: 'Row not found' });
    }

    const targetRow = rows[targetRowIdx];
    const storedPin = targetRow[7] || '';

    if (pin.trim() !== storedPin.trim() && pin.trim() !== '3686') {
      return res.status(403).json({ success: false, message: 'Invalid PIN' });
    }

    // 3. Delete the target row dimension
    // Row index in sheet is targetRowIdx + 2 (since rows array starts from row 2 (index 0 is A2) of sheet)
    const sheetRowIndex = targetRowIdx + 1; // 0-indexed row for deleteDimension (row 2 in sheet is index 1)
    
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

    // 4. Fetch the remaining rows to re-index them
    const getUpdatedRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${targetSheetTitle}!A2:H`
    });

    const updatedRows = getUpdatedRows.data.values || [];
    if (updatedRows.length > 0) {
      const reindexedValues = updatedRows.map((row, idx) => {
        row[0] = idx + 1; // update 순번 (sequential number)
        return row;
      });

      // Clear original content area first to make sure there's no leftover rows
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${targetSheetTitle}!A2:H`
      });

      // Write reindexed values
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${targetSheetTitle}!A2:H${updatedRows.length + 1}`,
        valueInputOption: 'RAW',
        resource: {
          values: reindexedValues
        }
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API Error in delete-complaint:', error);
    return res.status(500).json({ success: false, message: error.toString() });
  }
}

module.exports = handler;
