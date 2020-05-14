const {BaseComponent} = require('xc-core');
const Handlebars = require("handlebars");
const fs = require('fs');
const promisify = require('util').promisify;
const path = require('path');


class Config extends BaseComponent {

  constructor(app) {
    super(app);
    this.app = app;
  }

  async init(app) {

    console.log('config.init()');

    try {

      /* get database config */
      let dbConfig = await promisify(fs.readFile)(
        path.join(__dirname, '..', '..', 'config.xc.json'),
        "utf8"
      );

      /* replace environment variables with its values */
      dbConfig = JSON.parse(dbConfig, (key, value) => {
        return typeof value === 'string' ? Handlebars.compile(value, {noEscape: true})(process.env) : value;
      });

      /* find and set current environment value - defaults to dev */
      const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
      app.$config.env = env;

      /* load default config */
      Object.assign(app.$config, require(`./default.config`));

      /* load environment specific config */
      const envConfig = require(`./${env}.config.js`);
      Object.assign(app.$config, envConfig);

      /* load db connections params */
      app.$config.dbs = dbConfig.envs[env].db

    } catch (e) {
      console.log(e);
      throw e;
    }

  }


}


module.exports = Config;
