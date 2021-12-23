require('chai').should();
const path = require('path');
const fs = require('fs');
const { fake, replace, restore } = require('sinon');
const { stderr } = require('test-console');

const lib = '../../../lib';
const Init = require(`${lib}/runner/init`);

describe('Init', function () {
  describe('constructor', function () {
    const templatePath = 'a';
    const targetFile = 'b';
    let init;
    before(function () {
      init = new Init(templatePath, targetFile);
    });
    it('should create an Init', function () {
      (init instanceof Init).should.be.true;
      Init.name.should.equal('Init');
    });
    it('should resolve templatePath into this.template', function () {
      init.template.should.equal(path.resolve(templatePath));
    });
    it('should resolve targetFile into this.target', function () {
      init.target.should.equal(path.resolve(targetFile));
    });
  });
  describe('FileExistsError', function () {
    it('should be accessable by the class', function () {
      Init.FileExistsError.should.be.ok;
    });
  });
  describe('go', function () {
    describe('regular', function () {
      const template = 'a';
      const target = 'b';
      let inspect;
      let existsSync;
      let copyFileSync;
      before(function () {
        const init = new Init('.', '.');
        init.target = target;
        init.template = template;
        existsSync = replace(fs, 'existsSync', fake.returns(false));
        copyFileSync = replace(fs, 'copyFileSync', fake());
        inspect = stderr.inspect();
        init.go();
        inspect.restore();
      });
      after(function () {
        restore();
      });
      it('should call fs.existsSync(this.target)', function () {
        existsSync.calledWith(target).should.be.true;
      });
      it('should call fs.copyFileSync(this.template, this.target)', function () {
        copyFileSync.calledWith(template, target).should.be.true;
      });
      it('should print a success message to stderr', function () {
        inspect.output[0].should.include('Created');
        inspect.output[0].should.include(target);
      });
      it('should print a success terminated with a newline', function () {
        inspect.output[0].slice(-1).should.equal('\n');
      });
    });
    describe('existing target', function () {
      const target = 'theTarget';
      let error;
      before(function () {
        replace(fs, 'existsSync', fake.returns(true));
        const init = new Init('.', '.');
        init.target = target;
        try {
          init.go();
        } catch (e) {
          error = e;
        }
      });
      after(function () {
        restore();
      });
      it('should throw FileExistsError for existing target', function () {
        (error instanceof Init.FileExistsError).should.be.true;
      });
      it('should have a informative error message', function () {
        error.message.should.have.string(target);
        error.message.should.have.string('exists');
      });
    });
  });
});
