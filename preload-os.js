const os = require('os');
os.hostname = () => 'WorkPC';
console.log('[Antigravity Bypass] os.hostname() successfully mocked to "WorkPC".');
