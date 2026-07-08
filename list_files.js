const { google } = require('googleapis');
const auth = new google.auth.JWT(
  'drive-uploader@ansan-potal.iam.gserviceaccount.com',
  null,
  `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDRVduOOq29nbrZ\nx3+H3rlMpvr8oFek47nKvfmQQ0oXE9RT6AMzb5aWi8IVW1N8RuAewN/cZBLJXnzU\nfo5OsQnmKx5ZAztUZA1x10UCU33/xWvjllNSIxzbogE4VqA17KoZrXa7UeLv7JDb\ncWj+py0gnXYopj8uIVzE58gIe79OaYnNvDI+opv1vmgm7YvnHje4IkGx0npdXY9V\nPvyFnWCYzki34fP6Wda6dlGvdFVzrdgmxi4m8L4UmyEq2lZpAo0X7RZi2JeNdLCk\n5LBbLBoRX+CMz4Bxj4dtX0nZNKxff1hwJhi9arHeqoiZlU4atzb0crL9FMmjLDUs\nNLN4WvTVAgMBAAECggEAA4BHG3/z68EfT1poXVsattHvZZm0MerMBg3ybwo+KFh4\nGf+EBjB6CryJSf9swHtC+rImNQ/fxr6WoeJ1EZLyzJ4N/8qSgBcZv+s3sIZcaQbK\ntWtGfO0ZmC+Di7XDjRqa1g+mjSqRtkSjnQlo0Do80/roY9HWKk/7n32hROyCAQts\nWxsCQrrqKrrcrbDjiYDpArvJZYbebxxyCzo4hxjKtOyOfPA7CL+V0emxV5anH0RS\nrwTuLT4TTcsl1niXiln1Uex+DKRJoJZfz19kvi/REYMecsatqAm4CZar/QCldilK\nWd2xQK4LGKv0SukYoSWAWjtLfNrISXrEHdYcD3fvQQKBgQDs12Yr+o6XUTs0nyPq\nqL/nveLYY1nuYOUxQ324T1v/hZa5EFFqSDPiiNxwN6OP1aGcO2B3xv4Y5IlbojvH\nBMT4ZGEpj887xnhUPBpt0Sngq+2V/TUq3dWSXSPDwTXXJPKvVI+45/AXgABvflK4\n5rjAa5HwtLU98ub6sE5vYeabJQKBgQDiRNp+SlfhRHMz6S0HjmUy83VKTC3x7ZJn\nnY0tOleiXhsu6PEA4PLXinznDNjzSTR7LRMX8KxYJPyaoH2P6hRslAn3pJCcOc+I\nBCoOG6OS66fZSfkkeAlZYPZtDUCRAt9DPYG62wPheu8s+B1Mw9BAMw3AnOZ8yS9Y\n4CYdam4b8QKBgGFNmXdmCCEYyXc0DoCA9d7Sv5jhMHhkLKVRshv/1q8jBipgDuLY\naSCf09jysusL/MqABoEPKyO0+M3B2EdKqVXXf6egoqZPQu5whvcpIMhiOkkN70L+\nQplQVLo+7czHLEFmP2nbOGOfPg6QWpIGkE7Vou6+f1vFKKpDtuXB1glVAoGBAKzW\nZYQkq75SeCGGEzR7bAggek63pDzx+WyWp7mNoFVRxzftDfNa4YUNr10arjogiCsz\nAiu+Vxe5oQ9IWsFs0A8kgfydwyzi6AkBDVLbf/aBdiR/4gUegB26+GHSxqg+ZmbJ\ne+hM1kkNi9dw64iw5smzdeTUtSdK0pT0G4lKvDMxAoGBANO47/xJ2wDqe2xb0x4l\nWZKFTYTwSdwkoEXdrh/rLySkfRqYlrHH34htMoW9gLnt+WierfcTNVLytj3yFIiH\ny7NRSKSpwR1bMySX+YDE7yVV+AiKDpC94cnR1dkDG9AYrPX4Ql/VcsJrtgNNjWWH\nQiS0bBb24PBNR1slZei4RqY+\n-----END PRIVATE KEY-----\n`.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/drive']
);
const drive = google.drive({ version: 'v3', auth });
drive.about.get({
  fields: 'storageQuota, user'
}).then(res => {
  console.log('User:', res.data.user);
  console.log('Storage Quota:', res.data.storageQuota);
}).catch(err => {
  console.error('Error:', err.message);
});
