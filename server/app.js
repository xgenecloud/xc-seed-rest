const ServerComponents = require('xc-core').Components;

/* Serverless related includes */
const getRawBody = require('raw-body');
const AliServer = require('@webserverless/fc-express').Server;
const awsServerlessExpress = require('aws-serverless-express')
const createHandler = require("azure-function-express").createHandler;


/* variables */
let serverComponents = {};
let appSingleton = null;

async function start() {

  try {

    console.time('Server started in');

    /* Create server components in app.components.js */
    serverComponents = new ServerComponents(require('./app.components'));

    /* Init all server components */
    await serverComponents.init();

    /* Start the server */
    serverComponents.router.start();

    console.timeEnd('Server started in');

    printBanner(serverComponents);

  } catch (e) {
    console.log(e);
    throw e;
  }

}


const init = new Promise((resolve, reject) => {
  if (!appSingleton) {
    start().then(() => {
      if (serverComponents.$config.aws.lambda) {
        /* Serverless : AWS Lambda */
        resolve(appSingleton = awsServerlessExpress.createServer(serverComponents.router.router))
      } else if (serverComponents.$config.azure.functionApp) {
        /* Serverless : Azure Function App */
        resolve(appSingleton = serverComponents.router.router);
      } else if (serverComponents.$config.gcp.cloudFunction) {
        /* Serverless : GCP Cloud Function */
        resolve(appSingleton = serverComponents.router.router);
      } else if (serverComponents.$config.zeit.now) {
        /* Serverless : Zeit Now */
        resolve(appSingleton = serverComponents.router.router);
      } else if (serverComponents.$config.alibaba.functionCompute) {
        /* Serverless : Alibaba Function Compute */
        resolve(appSingleton = new AliServer(serverComponents.router.router));
      } else if (serverComponents.$config.serverlessFramework.express) {
        const serverless = require('serverless-http');
        /* Serverless : Serverless framework */
        resolve(appSingleton = serverless(serverComponents.router.router));
      } else {
        /* Serverless : Server */
        resolve(appSingleton = serverComponents.router.router);
      }
    }).catch((e) => reject(e))
  } else {
    resolve(appSingleton);
  }
})


module.exports = (...args) => {
  init.then((appServer) => {
    createHandler(appServer)(...args);
  })
}

module.exports.lambda = (event, context) => {
  init.then((appLambda) => {
    awsServerlessExpress.proxy(appLambda, event, context)
  })
}

module.exports.app = async function (...args) {
  const appServer = await init;
  return appServer(...args)
}

module.exports.zeit = function (req, res) {
  init.then(app => {
    app(req, res);
  })
}

module.exports.ali = async function (req, res, context) {
  req.body = await getRawBody(req);
  const server = await init;
  server.httpProxy(req, res, context)
}


module.exports.serverless = async (event, context) => {
  const handler = await init;
  return await handler(event, context);
};


function printBanner(server) {
  /**************** START : print welcome banner ****************/
    // const clear = require('clear');
  const Table = require('cli-table');
  /* print stats */
  let table = new Table({
    head: ['Components', 'Code Path'],
    colWidths: [25, 55]
  });

  table.push(
    ['Routers', './server/routers/**/*.router.js'],
    ['Services', './server/services/**/*.service.js'],
    ['Middlewares', './server/routers/**/*.middleware.js'],
    ['Global Middlewares', './server/middlewares/**/*.middleware.js'],
    ['Models', './server/models/**/*.model.js'],
    ['Server URL', `http://localhost:${server.$config.port}`],
  );


  // clear();
  console.log(`\n\n\t\tGenerating REST APIs at the speed of your thought..\n`.green);
  console.log(table.toString());
  console.log('\n');
  console.log(`\t\t\tTotal APIs Created : ${server.router.apisCount}\n\n\n\n`.green);
  /**************** END : print welcome banner ****************/
}
