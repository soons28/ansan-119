const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Manually parse .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  });
}

const SPREADSHEET_ID = '1uO9wHuO9c629s54pCfExWHUVdeB-wj1d71p1hRlYkQU';

async function test() {
  try {
    const auth = new google.auth.JWT(
      (process.env.GOOGLE_CLIENT_EMAIL ? process.env.GOOGLE_CLIENT_EMAIL.trim() : ""),
      null,
      (process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.trim().replace(/\\n/g, '\n') : ''),
      ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });
    
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: '지하!A1:H100'
    });
    
    const rows = getRows.data.values || [];
    console.log("Total rows:", rows.length);
    rows.forEach((row, i) => {
      console.log(`Row ${i}:`, {
        colA: row[0],
        colB: row[1],
        colC: row[2],
        colF: row[5],
        colG: row[6] ? row[6].substring(0, 30) : ""
      });
    });
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

test();
