module.exports = {
  /* order in below list is important - independent to dependent */
  components: [
    {
      title: 'config',
      path: './server/config/config.index.js',
    },
    {
      title: 'mailer',
      path: './server/components/mailer/mailer.index.js',
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
    }
  ]
};