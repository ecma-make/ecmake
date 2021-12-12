module.exports = class Task {
  constructor() {
    this.___description = null;
    this.___listed = false;
    this.___dependencies = [];
    this.___willDoCallback = () => {};
    return new Proxy(this, { // eslint-disable-line no-constructor-return
      get(target, prop, receiver) {
        if ((!prop.toString().startsWith('___'))
                    && (target[prop] === undefined)) {
          Reflect.set(target, prop, new Task(), receiver);
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  }

  get result() {
    return this.___result;
  }

  listed() {
    this.___listed = true;
    return this;
  }

  described(desc) {
    this.___description = desc;
    return this;
  }

  awaits(...args) {
    args.forEach((arg) => {
      this.___dependencies.push(arg);
    });
    return this;
  }

  will(callback) {
    this.___willDoCallback = callback;
    return this;
  }

  go() {
    if (!this.___promise) {
      const before = this.___dependencies.map((task) => task.go());
      this.___promise = Promise.all(before).then(() => new Promise((resolve, reject) => {
        try { resolve(this.___willDoCallback()); } catch (error) { reject(error); }
      })).then((value) => {
        this.___result = value;
      });
    }
    return this.___promise;
  }
};
