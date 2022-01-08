module.exports = class Task {
  constructor() {
    this.___parent = null;
    this.___description = null;
    this.___listed = false;
    this.___dependencies = [];
    this.___willDoCallback = () => {};
    return new Proxy(this, { // eslint-disable-line no-constructor-return
      get(target, prop, receiver) {
        if ((!prop.toString().startsWith('___')) && (target[prop] === undefined)) {
          const task = new Task();
          task.___parent = receiver;
          Reflect.set(target, prop, task, receiver);
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  }

  getParent() {
    return this.___parent;
  }

  getName() {
    if (!this.___parent) return 'root';
    return Object.getOwnPropertyNames(this.___parent)
      .filter((key) => this.___parent[key] === this)[0];
  }

  getStack() {
    const stack = this.___parent ? this.___parent.getStack() : [];
    return stack.concat([this]);
  }

  getPath(withRoot = false) {
    return (withRoot ? this.getStack() : this.getStack().slice(1))
      .reduce((p, c) => `${p}.${c.getName()}`, '')
      .slice(1);
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

  // eslint-disable-next-line
  handleWillDoArgument(callbackOrPromise) {
    if (callbackOrPromise instanceof Promise) {
      return () => callbackOrPromise;
    } if (callbackOrPromise.length > 0) {
      return () => new Promise(callbackOrPromise);
    }
    return callbackOrPromise;
  }

  will(callback) {
    this.___willDoCallback = this.handleWillDoArgument(callback);
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
