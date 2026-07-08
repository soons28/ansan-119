const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

async function test() {
  const templatePath = path.join(__dirname, 'withdrawal', 'index.html');
  const html = fs.readFileSync(templatePath, 'utf8');
  
  // Extract EMBEDDED_PDF_BASE64
  const match = html.match(/const EMBEDDED_PDF_BASE64 = "(.*?)";/);
  if (!match) {
    console.error('EMBEDDED_PDF_BASE64 not found');
    return;
  }
  const base64 = match[1];
  const templateBytes = Buffer.from(base64, 'base64');
  console.log('Template size:', templateBytes.length);

  // Load NanumGothic
  console.log('Fetching NanumGothic...');
  const fontRes = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/nanumgothic/NanumGothic-Regular.ttf');
  const fontBytes = await fontRes.arrayBuffer();
  console.log('Font size:', fontBytes.byteLength);

  // Generate PDF
  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);
  
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  
  firstPage.drawText('홍길동', {
    x: 376,
    y: 552,
    size: 16,
    font: customFont
  });

  const pdfBytes = await pdfDoc.save();
  console.log('Generated PDF size (no signature):', pdfBytes.length);
  
  // Save to test
  fs.writeFileSync('test_generated.pdf', pdfBytes);
}

test().catch(console.error);
