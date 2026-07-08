const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, 'assets', '위임장_양식.pdf');
const htmlSourcePath = path.join(__dirname, 'public', 'index.html');
const outputPath = path.join(__dirname, 'index.html');

if (!fs.existsSync(pdfPath)) {
  console.error('원본 PDF 파일이 없습니다:', pdfPath);
  process.exit(1);
}

if (!fs.existsSync(htmlSourcePath)) {
  console.error('HTML 소스 파일이 없습니다:', htmlSourcePath);
  process.exit(1);
}

// 1. PDF 파일을 Base64 문자열로 변환
console.log('PDF 템플릿 변환 중...');
const pdfBase64 = fs.readFileSync(pdfPath).toString('base64');

// 2. HTML 템플릿을 읽어서 플레이스홀더 치환
console.log('HTML 소스 코드 읽는 중...');
let htmlContent = fs.readFileSync(htmlSourcePath, 'utf8');

// 플레이스홀더 문자열 치환
htmlContent = htmlContent.replace('"/* EMBEDDED_PDF_BASE64_PLACEHOLDER */"', `"${pdfBase64}"`);

// 3. 빌드 결과 출력
fs.writeFileSync(outputPath, htmlContent, 'utf8');
console.log('====================================================');
console.log('🎉 HTML 빌드가 완료되었습니다!');
console.log(`💾 빌드 파일 위치: ${outputPath}`);
console.log(`🔗 오프라인 상태에서도 위 HTML 파일을 더블클릭하면 실행됩니다.`);
console.log('====================================================');
