const root = module.exports = require('@ecmake/ecmake').makeRoot();

root.default
  .described('defaults to all')
  .awaits(root.all);

root.all
  .listed()
  .awaits(root.hello.planet, root.hello.world);

root.setup
  .described("it's the mars")
  .will(() => ({ planet: 'mars', countdown: 1000 }));

root.hello.world
  .listed()
  .will(() => console.log('Hello world!'));

root.hello.planet
  .described('to the planet given in setup')
  .listed()
  .awaits(root.countdown)
  .will(() => { console.log(root.countdown.result); });

root.countdown
  .awaits(root.setup)
  .will(() => new Promise(
    (resolve) => {
      setTimeout(() => {
        resolve(`Hello ${root.setup.result.planet}, here we go!`);
      }, root.setup.result.countdown);
    },
  ));
