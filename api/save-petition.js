const { google } = require('googleapis');
const { Readable } = require('stream');

const SPREADSHEET_ID = '15hUBBN8mKwY0g00b6cKb01SVCeLRhXxzHKIqq3DhZu0';
const TARGET_FOLDER_ID = '1uVuv9jdogyjRbCUHnAqPZkFYDHfteT31'; // 04_시청제출 탄원서 폴더 ID

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { name, address, phone, userType, signatureImg, pin } = req.body;
  if (!name || !address || !pin) {
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
    const drive = google.drive({ version: 'v3', auth });
    const targetSheetTitle = "탄원서";

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
        range: `${targetSheetTitle}!A1:K1`,
        valueInputOption: 'RAW',
        resource: {
          values: [['순번', '성명', '동호수', '자격', '연락처', 'IP 주소', '접속 기기', '서명 일시', '서명 이미지 URL', 'PIN', '서명 이미지(자동)']]
        }
      });
    }

    // 2. Get current rows to calculate index
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${targetSheetTitle}!A:A`
    });
    
    const rows = getRows.data.values || [];
    const nextIndex = rows.length;

    // 3. Upload signature image to the target folder DIRECTLY (No GAS redirect)
    let finalSignatureUrl = '';
    if (signatureImg && signatureImg.startsWith('data:image/png;base64,')) {
      try {
        const base64Data = signatureImg.replace(/^data:image\/png;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `서명_${nextIndex}_${name.replace(/\s+/g, '')}_${address.replace(/\s+/g, '')}.png`;

        const fileMetadata = {
          name: filename,
          parents: [TARGET_FOLDER_ID] // direct mapping inside target folder
        };
        const media = {
          mimeType: 'image/png',
          body: Readable.from(buffer)
        };

        const uploadedFile = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id'
        });

        const fileId = uploadedFile.data.id;
        try {
          await drive.permissions.create({
            fileId: fileId,
            resource: {
              role: 'reader',
              type: 'anyone'
            }
          });
        } catch (permErr) {
          console.error('Error setting public permissions for signature file:', permErr);
        }

        finalSignatureUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
      } catch (uploadErr) {
        console.error('Error uploading signature file to Drive:', uploadErr);
        finalSignatureUrl = signatureImg;
      }
    }

    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    const timestampStr = kstDate.toISOString().replace('T', ' ').substring(0, 19);

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
    const clientDevice = req.headers['user-agent'] || 'Unknown Device';

    // Append to sheet (11개 열 등록 - K열에 IMAGE 자동 수식 탑재)
    const formulaRowIdx = nextIndex + 1; // row index in sheet (1-based, e.g. row 2)
    const imageFormula = `=IMAGE(I${formulaRowIdx})`;
    
    // Prepend single quote to force string type for phone number (preventing Google Sheets from stripping leading zero)
    const rawPhone = (phone || '').trim();
    const formattedPhoneForSheet = rawPhone ? `'${rawPhone}` : '';

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${targetSheetTitle}!A2`,
      valueInputOption: 'USER_ENTERED', // MUST use USER_ENTERED to parse formula
      resource: {
        values: [[nextIndex, name.trim(), address.trim(), (userType || '구분소유자').trim(), formattedPhoneForSheet, clientIp, clientDevice, timestampStr, finalSignatureUrl, pin.trim(), imageFormula]]
      }
    });

    return res.status(200).json({ success: true, index: nextIndex, driveFileUrl: finalSignatureUrl });
  } catch (error) {
    console.error('API Error in save-petition:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || error.toString(),
      detail: error.stack || ''
    });
  }
}

module.exports = handler;
