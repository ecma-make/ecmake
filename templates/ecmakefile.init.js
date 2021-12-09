const root = module.exports = require('@ecmake/ecmake').makeRoot();

root.default.titled('the default target').awaits(root.all);
root.all.titled('run all').awaits(root.hello.star, root.hello.world);
root.hello.world.titled('still at home').will(
  () => console.log('Hello world!'),
);
root.hello.star.titled('up to the stars').awaits(root.countdown).will(
  () => { console.log(root.countdown.result); },
);
root.countdown.awaits(root.setup).will(() => new Promise(
  (resolve) => {
    setTimeout(() => {
      resolve(`Hello ${root.setup.result.star}, here we go!`);
    }, root.setup.result.countdown);
  },
));
root.setup.will(() => ({ star: 'mars', countdown: 1000 }));
