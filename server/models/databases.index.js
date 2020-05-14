const {BaseComponent} = require('xc-core');
const {DbFactory} = require('xc-data-mapper');
const path = require('path');
const glob = require('glob');
const {Migrator} = require('xc-migrator');


class Databases extends BaseComponent {

  constructor(app) {
    super(app);
    this.app = app;
  }


  async init(app) {

    console.log('databases.init()');

    try {

      /* for eacch db in environment : apply db migrations and load models */
      for (const db of app.$config.dbs) {

        const {meta: {dbAlias}} = db;

        /* Update database migrations */
        const migrator = new Migrator();

        await migrator.sync({
          folder: process.cwd(),
          env: app.$config.env,
          dbAlias: dbAlias
        });

        await migrator.migrationsUp({
          folder: process.cwd(),
          env: app.$config.env,
          dbAlias: dbAlias,
          migrationSteps: 99999,
          sqlContentMigrate: 1,
        });

        /* create db driver */
        app.$dbs[dbAlias + 'Db'] = DbFactory.create(db)

        /* load models for this database */
        app.$dbs[dbAlias] = app.$dbs[dbAlias] || {};
        let modelsPath = path.join(__dirname, dbAlias, '**', '*.model.js');
        glob.sync(modelsPath).forEach((file) => {
          let model = require(file)
          app.$dbs[dbAlias][model.name] = new model({dbDriver: app.$dbs[dbAlias + 'Db']});
        });

      }

    } catch (e) {
      console.log(e);
      throw e;
    }

  }


}


module.exports = Databases;
