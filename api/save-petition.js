const { google } = require('googleapis');
const { Readable } = require('stream');

const SPREADSHEET_ID = '1YdcpcUSiBHHDrL-tyYvJ1eZGnV4kAIKTli732thFGIU';

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
        range: `${targetSheetTitle}!A1:J1`,
        valueInputOption: 'RAW',
        resource: {
          values: [['순번', '성명', '동호수', '자격', '연락처', 'IP 주소', '접속 기기', '서명 일시', '서명 이미지 URL', 'PIN']]
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

    // 3. Set Destination Folder ID to "1uVuv9jdogyjRbCUHnAqPZkFYDHfteT31" (User Shared Folder)
    const targetFolderId = "1uVuv9jdogyjRbCUHnAqPZkFYDHfteT31";

    // 4. Upload signature image to the target folder
    let finalSignatureUrl = '';
    if (signatureImg && signatureImg.startsWith('data:image/png;base64,')) {
      try {
        const base64Data = signatureImg.replace(/^data:image\/png;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `서명_${nextIndex}_${name.replace(/\s+/g, '')}_${address.replace(/\s+/g, '')}.png`;

        const fileMetadata = {
          name: filename,
          parents: [targetFolderId]
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

        try {
          await drive.permissions.create({
            fileId: uploadedFile.data.id,
            requestBody: {
              role: 'reader',
              type: 'anyone'
            }
          });
        } catch (permErr) {
          console.error('Error sharing uploaded file:', permErr);
        }

        finalSignatureUrl = `https://docs.google.com/uc?export=download&id=${uploadedFile.data.id}`;
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

    // Append to sheet (10개 열 등록)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${targetSheetTitle}!A2`,
      valueInputOption: 'RAW',
      resource: {
        values: [[nextIndex, name.trim(), address.trim(), (userType || '구분소유자').trim(), (phone || '').trim(), clientIp, clientDevice, timestampStr, finalSignatureUrl, pin.trim()]]
      }
    });

    return res.status(200).json({ success: true, index: nextIndex, driveFileUrl: finalSignatureUrl });
  } catch (error) {
    console.error('API Error in save-petition:', error);
    return res.status(500).json({ success: false, message: error.toString() });
  }
}

module.exports = handler;
