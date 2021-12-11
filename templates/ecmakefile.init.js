const root = module.exports = require('@ecmake/ecmake').makeRoot();

root.default.titled('the default target')
    .awaits(root.all);

root.all.titled('run all')
    .awaits(root.hello.planet, root.hello.world);

root.setup
    .will(() => { return { planet: 'mars', countdown: 1000 }; });

root.hello.world.titled('still at home')
    .will(() => console.log('Hello world!'));

root.hello.planet.titled('to the stars')
    .awaits(root.countdown)
    .will( () => { console.log(root.countdown.result); });

root.countdown
    .awaits(root.setup)
    .will(() => new Promise(
      (resolve) => {
        setTimeout(() => {
          resolve(`Hello ${root.setup.result.planet}, here we go!`);
        }, root.setup.result.countdown);
      },
    ));
