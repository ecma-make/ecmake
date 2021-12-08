const path = require('path');
const fs = require('fs');

module.exports = class Init {
  constructor(templatePath, targetFile) {
    this.template = path.resolve(templatePath);
    this.target = path.resolve(targetFile);
  }

  go() {
    if (fs.existsSync(this.target)) {
      const msg = `The file [${this.target}] already exists.`;
      throw new Error(msg);
    }
    fs.copyFileSync(this.template, this.target);
    process.stderr.write(`Created ${this.target}.`);
  }
};
