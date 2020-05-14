module.exports.config = {
  components: [
    {
      title: 'config',
      path: './server/config/config.index.js',
    },
    {
      title: 'dbs',
      path: './server/models/databases.index.js',
    },
    {
      title: 'middlewares',
      path: './server/middlewares/middlewares.index.js',
    },
    {
      title: 'services',
      path: './server/services/services.index.js',
    },
    {
      title: 'router',
      path: './server/routers/routers.index.js',
    },
    {
      title: 'mailer',
      path: './server/components/mailer/mailer.index.js',
    }
  ]
};