require('chai').should();
const { expect } = require('chai');

describe('general Proxy behaviour', () => {
  describe('Proxy with empty handler', () => {
    it('shows that original and proxy are two different objects', () => {
      const original = {};
      const proxy = new Proxy(original, {});
      expect(proxy).not.equal(original);
    });
    it('evaluates proxy and origianl to be deep equal', () => {
      const original = {};
      const proxy = new Proxy(original, {});
      expect(proxy).to.deep.equal(original);
    });
    it('sets and gets down to the original', () => {
      const original = {};
      const proxy = new Proxy(original, {});
      proxy.x = 1;
      expect(original.x).to.equal(1);
      original.x = 2;
      expect(proxy.x).to.equal(2);
    });
    describe('consistent when accessing this', () => {
      const original = {
        getThat() { return this; },
        get that() { return this; },
      };
      const proxy = new Proxy(original, { });
      it('evaluates getters to the proxy', () => {
        expect(proxy.that).to.be.equal(proxy);
      });
      it('evaluates methods to the proxy, too', () => {
        expect(proxy.getThat()).to.be.equal(proxy);
      });
      it('chai should works like chai expect', () => {
        proxy.that.should.equal(proxy);
        proxy.getThat().should.equal(proxy);
      });
    });
  });
  describe('Proxy without reflection', () => {
    it('sets and gets down to the original like the empty handler', () => {
      const original = {};
      const proxy = new Proxy(original, {
        set(target, prop, value) { target[prop] = value; }, // eslint-disable-line no-param-reassign
        get(target, prop) { return target[prop]; },
      });
      proxy.x = 1;
      expect(original.x).to.equal(1);
      original.x = 2;
      expect(proxy.x).to.equal(2);
    });
    it(
      'detects original as the target in get and set',
      () => {
        const original = {};
        let targetInSet;
        let targetInGet;
        const proxy = new Proxy(original, {
          set(target, prop, value) {
            targetInSet = target;
            target[prop] = value; // eslint-disable-line no-param-reassign
          },
          get(target, prop) {
            targetInGet = target;
            expect(target).to.equal(original);
            return target[prop];
          },
        });
        proxy.x = 1;
        proxy.x; // eslint-disable-line no-unused-expressions
        expect(targetInSet).to.equal(original);
        expect(targetInGet).to.equal(original);
      },
    );
    it(
      'detects proxy as the receiver in get and set',
      () => {
        const original = {};
        let receiverInSet;
        let receiverInGet;
        const proxy = new Proxy(original, {
          set(target, prop, value, receiver) {
            receiverInSet = receiver;
            target[prop] = value; // eslint-disable-line no-param-reassign
          },
          get(target, prop, receiver) {
            receiverInGet = receiver;
            return target[prop];
          },
        });
        proxy.x = 1;
        proxy.x; // eslint-disable-line no-unused-expressions
        expect(receiverInSet).to.equal(proxy);
        expect(receiverInGet).to.equal(proxy);
      },
    );
    describe('chaos when accessing this', () => {
      const original = {
        getThat() { return this; },
        get that() { return this; },
      };
      const proxy = new Proxy(original, {
        get(target, prop) {
          return target[prop];
        },
      });
      it('evaluates getters to the original', () => {
        expect(proxy.that).to.be.equal(original);
      });
      it('evaluates methods to the proxy', () => {
        expect(proxy.getThat()).to.be.equal(proxy);
      });
      it('chai should differs from chai expect', () => {
        expect(proxy.getThat()).to.be.equal(proxy);
        proxy.getThat().should.equal(original);
      });
      it('chai should evaluates to original in both cases', () => {
        proxy.getThat().should.equal(original);
        proxy.that.should.equal(original);
      });
    });
  });
  describe('Reflect in Proxy without the receiver being set', () => {
    it('sets and gets down to the original like the empty handler', () => {
      const original = {};
      const proxy = new Proxy(original, {
        get(target, prop) {
          return Reflect.get(target, prop);
        },
        set(target, prop, value) {
          Reflect.set(target, prop, value);
        },
      });
      proxy.x = 1;
      expect(original.x).to.equal(1);
      original.x = 2;
      expect(proxy.x).to.equal(2);
    });
    describe('chaos when accessing this', () => {
      const original = {
        getThat() { return this; },
        get that() { return this; },
      };
      const proxy = new Proxy(original, {
        get(target, prop) {
          return Reflect.get(target, prop);
        },
      });
      it('evaluates getters to the original', () => {
        expect(proxy.that).to.be.equal(original);
      });
      it('evaluates methods to the proxy', () => {
        expect(proxy.getThat()).to.be.equal(proxy);
      });
      it('chai should differs from chai expect', () => {
        expect(proxy.getThat()).to.be.equal(proxy);
        proxy.getThat().should.equal(original);
      });
      it('chai should evaluates to original in both cases', () => {
        proxy.getThat().should.equal(original);
        proxy.that.should.equal(original);
      });
    });
  });

  describe('Reflect in Proxy with the receiver being set to original', () => {
    it('sets and gets down to the original like the empty handler', () => {
      const original = {};
      const proxy = new Proxy(original, {
        get(target, prop) {
          return Reflect.get(target, prop, target);
        },
        set(target, prop, value) {
          Reflect.set(target, prop, value, target);
        },
      });
      proxy.x = 1;
      expect(original.x).to.equal(1);
      original.x = 2;
      expect(proxy.x).to.equal(2);
    });
    describe('chaos when accessing this', () => {
      const original = {
        getThat() { return this; },
        get that() { return this; },
      };
      const proxy = new Proxy(original, {
        get(target, prop) {
          return Reflect.get(target, prop, target);
        },
      });
      it('evaluates getters to the original', () => {
        expect(proxy.that).to.be.equal(original);
      });
      it('evaluates methods to the proxy', () => {
        expect(proxy.getThat()).to.be.equal(proxy);
      });
      it('chai should differs from chai expect', () => {
        expect(proxy.getThat()).to.be.equal(proxy);
        proxy.getThat().should.equal(original);
      });
      it('chai should evaluates to original in both cases', () => {
        proxy.getThat().should.equal(original);
        proxy.that.should.equal(original);
      });
    });
  });
  describe('Reflect in Proxy with the receiver being set to proxy', () => {
    it('sets and gets down to the original like the empty handler', () => {
      const original = {};
      const proxy = new Proxy(original, {
        get(target, prop, receiver) {
          return Reflect.get(target, prop, receiver);
        },
        set(target, prop, value, receiver) {
          Reflect.set(target, prop, value, receiver);
        },
      });
      proxy.x = 1;
      expect(original.x).to.equal(1);
      original.x = 2;
      expect(proxy.x).to.equal(2);
    });
    it('does not cause a vicious circle in the proxy', () => {
      const original = {};
      const proxy = new Proxy(original, {
        get(target, prop, receiver) {
          return Reflect.get(target, prop, receiver);
        },
        set(target, prop, value, receiver) {
          Reflect.set(target, prop, value, receiver);
        },
      });
      proxy.x = 1;
      expect(proxy.x).to.equal(1);
    });
    describe('consistent when accessing this', () => {
      const original = {
        getThat() { return this; },
        get that() { return this; },
      };
      const proxy = new Proxy(original, {
        get(target, prop, receiver) {
          return Reflect.get(target, prop, receiver);
        },
      });
      it('evaluates getters to the proxy', () => {
        expect(proxy.that).to.be.equal(proxy);
      });
      it('evaluates methods to the proxy, too', () => {
        expect(proxy.getThat()).to.be.equal(proxy);
      });
      it('chai should works like chai expect', () => {
        proxy.that.should.equal(proxy);
        proxy.getThat().should.equal(proxy);
      });
    });
  });
});
