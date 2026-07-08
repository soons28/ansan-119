const fs = require('fs');
const path = require('path');

// 1. Update app.js
const appJsPath = path.join(__dirname, 'complaint', 'app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

// Replace sender info
const oldSender = 'sender: `성명: <strong>이경숙 및 아래 연명 구분소유주/입주자 일동</strong> (상세 인적사항 및 호실은 하단 연명부 참조)<br>주소: 경기도 안산시 단원구 산단로 326(안산유통상가 1차) 지하 나-40호, 41호 (보령식당) 외 각 소유주별 사업장`,';
const newSender = 'sender: `성명: <strong>이긍석 및 아래 연명 구분소유주/입주자 일동</strong> (상세 인적사항 및 호실은 하단 연명부 참조)<br>연락처: <br>주소: 경기도 안산시 단원구 산단로 342(안산유통상가 1차) 편익A동 지하 8호 외 각 소유주별 사업장`,';

// Replace body name
const oldBody = `body: \`1) 본 발신인(이경숙 및 하단 연명 소유주 일동)들은 귀 하(이하 '수신인')가 2026년 5월 하순경 각 소유주별로 발송한 ‘관리비 미납금 납부 최고’에 관한 내용증명(우편물 일체)을 수신하고, 이에 대한 공통의 답변 및 정당한 항변권을 행사하고자 본 문서를 발송합니다.`;
const newBody = `body: \`1) 본 발신인(이긍석 및 하단 연명 소유주 일동)들은 귀 하(이하 '수신인')가 2026년 5월 하순경 각 소유주별로 발송한 ‘관리비 미납금 납부 최고’에 관한 내용증명(우편물 일체)을 수신하고, 이에 대한 공통의 답변 및 정당한 항변권을 행사하고자 본 문서를 발송합니다.`;

// Replace footer signer
const oldFooter = 'footerSigner: "발신인: 이경숙 (인)",';
const newFooter = 'footerSigner: "발신인: 이긍석 (인)",';

appJs = appJs.replace(oldSender, newSender);
appJs = appJs.replace(oldBody, newBody);
appJs = appJs.replace(oldFooter, newFooter);

fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log("app.js updated successfully.");

// 2. Update index.html
const indexHtmlPath = path.join(__dirname, 'complaint', 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const oldTab = '지하 (이경숙 님 답변서)';
const newTab = '지하 (이긍석 님 답변서)';

indexHtml = indexHtml.replace(oldTab, newTab);
fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
console.log("index.html updated successfully.");
