const handler = require('./api/delete-complaint.js');

const req = {
  method: 'POST',
  body: {
    index: 0,
    pin: '1234',
    currentMode: 'basement'
  }
};

const res = {
  status(code) {
    console.log("STATUS CODE:", code);
    return this;
  },
  json(data) {
    console.log("JSON DATA:", data);
    return this;
  }
};

handler(req, res);
