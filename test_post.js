const fs = require('fs');

async function testPost() {
  const dummyPdfBase64 = Buffer.from('JVBERi0xLjQKJVRlc3QgUERG').toString('base64');
  const postData = {
    name: '테스트 채권자',
    unitNo: '편익 A동 101호',
    phone: '010-1234-5678',
    pdfBytes: dummyPdfBase64,
    type: 'consent',
    filename: '테스트위임장.pdf'
  };

  try {
    const res = await fetch('https://script.google.com/macros/s/AKfycbyCne5tnvdyfcMUR63VViL1Z5RyxPm3Y5oBSImJmkDPUtOul4wtXrPGrRg_XNOHLnqD/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(postData)
    });
    const text = await res.text();
    console.log('Response Status:', res.status);
    console.log('Response Text length:', text.length);
    console.log('Response Text preview:', text.substring(0, 1000));
  } catch (err) {
    console.error('Error posting to Apps Script:', err);
  }
}

testPost();
