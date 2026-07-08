const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

// os.hostname() 함수가 항상 영어 'WorkPC'를 반환하도록 조작합니다.
os.hostname = () => 'WorkPC';

const args = process.argv.slice(2);

console.log('Bypassing Hostname issues... running vercel with patched environment.');

// 환경 변수 내의 한글 '작업PC' 및 기타 비ASCII 문자를 제거/대체합니다.
const cleanEnv = {};
for (const key in process.env) {
  let val = process.env[key];
  if (typeof val === 'string') {
    // 한글(비ASCII) 포함 여부 검사 후 대체
    if (/[^\x00-\x7F]/.test(val)) {
      val = val.replace(/[^\x00-\x7F]/g, 'WorkPC');
    }
  }
  cleanEnv[key] = val;
}

const vercelProcess = spawn('npx', ['vercel', ...args], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...cleanEnv,
    COMPUTERNAME: 'WorkPC',
    LOGONSERVER: '\\\\WorkPC',
    USERDOMAIN: 'WorkPC',
    USERDOMAIN_ROAMINGPROFILE: 'WorkPC',
    // 자식 node 프로세스(vercel 등)에서도 preload-os.js가 우선 실행되도록 주입 (윈도우 역슬래시 이스케이프 방지를 위해 슬래시로 변경)
    NODE_OPTIONS: '-r "' + path.resolve(__dirname, 'preload-os.js').replace(/\\/g, '/') + '"'
  }
});

vercelProcess.on('exit', (code) => {
  process.exit(code);
});
