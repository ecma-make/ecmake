require('chai').should();
const { fake } = require('sinon');

class UnderTest {
  constructor(color = 'red') {
    this.color = color;
    this.mocked = false;
  }

  isMocked() {
    return this.mocked;
  }
}

describe('constructor mocking with sinon.fake()', () => {
  describe('UnderTest', () => {
    describe('.constructor()', () => {
      describe('when mocked', () => {
        const Mock = fake(function (color = 'green') {
          this.mocked = true;
          this.color = color;
        });
        let underTest;
        before(() => {
          underTest = new Mock();
        });
        it('should spy on constructor arguments', () => {
          Mock.calledOnce.should.be.true;
          Mock.calledWith('green').should.be.false;
          Mock.calledWith().should.be.true;
        });
        it('should mock with behaviour', () => {
          underTest.mocked.should.be.true;
          underTest.color.should.equal('green');
        });
      });
    });
    describe('.isMocked()', () => {
      describe('when not transferred to the protoype of Mock', () => {
        const Mock = fake(function (color = 'green') {
          this.mocked = true;
          this.color = color;
        });
        let underTest;
        before(() => {
          underTest = new Mock();
        });
        it('should throw TypeError', () => {
          let seen = false;
          try {
            underTest.isMocked();
          } catch (e) {
            (e instanceof TypeError).should.be.true;
            seen = true;
          }
          seen.should.be.true;
        });
      });
      describe('when transferred to the protoype of Mock', () => {
        const Mock = fake(function (color = 'green') {
          this.mocked = true;
          this.color = color;
        });
        let underTest;
        before(() => {
          Mock.prototype.isMocked = UnderTest.prototype.isMocked;
          underTest = new Mock();
        });
        it('should work', () => {
          underTest.isMocked().should.be.true;
        });
      });
    });
  });
});
