async function uploadToDrive(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { name, unitNo, pdfBytes, type = 'consent' } = req.body;
  if (!name || !unitNo || !pdfBytes) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const filename = type === 'withdrawal' 
      ? `취하서_${name.replace(/\s+/g, '')}_${unitNo.replace(/\s+/g, '')}.pdf`
      : `위임장_${name.replace(/\s+/g, '')}_${unitNo.replace(/\s+/g, '')}.pdf`;

    // Google Apps Script Web App URL provided by user
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbyCne5tnvdyfcMUR63VViL1Z5RyxPm3Y5oBSImJmkDPUtOul4wtXrPGrRg_XNOHLnqD/exec';

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        unitNo,
        pdfBytes,
        filename,
        type
      })
    });

    const result = await response.json();
    if (result.success) {
      return res.status(200).json({ success: true, fileId: result.fileId });
    } else {
      return res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Apps Script upload error:', error);
    return res.status(500).json({ success: false, message: error.toString() });
  }
}

module.exports = uploadToDrive;
