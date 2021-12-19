const fs = require('fs');
const path = require('path');

const rawText = fs.readFileSync(path.join(__dirname, './terminology-content.txt'), 'utf8');

let content;
eval(`content = \`${rawText}\``); // eslint-disable-line no-eval
module.exports = { header: 'Terminology', content };
