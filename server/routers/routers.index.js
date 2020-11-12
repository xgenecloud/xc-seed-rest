const {BaseComponent, XcUtils} = require('xc-core');
const path = require('path');
const glob = require('glob');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const session = require("express-session");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../tool/apis/swagger/swagger-base.xc');
const multer = require('multer')
const helmet = require('helmet')
// const rateLimit = require("express-rate-limit");
// const compression = require('compression')


console.log('==========', process.env.NODE_ENV)

class Router extends BaseComponent {

  constructor(app) {

    super(app);
    this.app = app;
    this.miniRouters = {};
    this.router = express();
    //this.apiBridge = new XcApiBridge({dir: './'})

  }

  async start() {

    if (!(this.app.$config.azure.functionApp || this.app.$config.aws.lambda || this.app.$config.zeit.now || this.app.$config.alibaba.functionCompute || this.app.$config.serverlessFramework.express)) {
      this.router.listen(this.app.$config.port, function () {
      })
    }
  }

  _getSessionStore() {
    const KnexSessionStore = require("connect-session-knex")(session);

    const store = new KnexSessionStore({
      knex: this.app.$dbs.primaryDb,
      tablename: "sessions"
    });

    return store;
  }

  initMiddlewares() {
    //this.router.use(this.apiBridge.record);
    // this.router.use(compress)
    this.router.use(bodyParser.urlencoded({extended: true}));
    this.router.use(bodyParser.json());
    this.router.use(morgan('tiny'));
    this.router.use(helmet());
    // this.router.use(compression());


    this.router.use(express.static(path.join(__dirname, '../public')));

    this.router.use(cors({
      origin: ['http://localhost:3000'],
      methods: ['POST', 'GET', 'OPTIONS', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
      credentials: true // enable set cookie
    }));

    // const apiLimiter = rateLimit({
    //   windowMs: 15 * 60 * 1000, // 15 minutes
    //   max: 100
    // });
    //
    // // only apply to requests that begin with /api/
    // this.router.use("/api/", apiLimiter);

    /**************** START : multer ****************/
    this.storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(),'server','public'));
      },
      filename: function (req, file, cb) {
        console.log(file);
        cb(null, Date.now() + "-" + file.originalname);
      }
    });

    this.upload = multer({storage: this.storage});
    /**************** END : multer ****************/

    /**************** START : multer routes ****************/
    /**
     * Download and upload api is to demonstrate how these apis works
     * Please modify as per your business needs
     * */
    this.router.post(
      "/upload",
      this.upload.single("file"),
      this.uploadFile
    );
    this.router.post(
      "/uploads",
      this.upload.array("files", 10),
      this.uploadFiles.bind(this)
    );
    this.router.get("/download", this.downloadFile);
    /**************** END : multer routes ****************/

    // Todo: Azure function app has issue with session
    if (!(this.app.$config.azure.functionApp || this.app.$config.zeit.now || this.app.$config.serverlessFramework.express)) {
      this.router.use(
        session({
          resave: false,
          saveUninitialized: true,
          secret: "The two most important days in your life are the day you are born and the day you find out why!",
          cookie: {
            maxAge: 24 * 60 * 60 * 1000 // One day
          },
          store: this._getSessionStore()
        })
      );
    }
    this.router.use(cookieParser('XGene Cloud')); //session secret - should be overriden
    this.router.use(passport.initialize());

    if (!(this.app.$config.azure.functionApp || this.app.$config.serverlessFramework.express)) {
      this.router.use(passport.session());
    }

    this.router.get('/health', this.health)
    if (this.app.$config.monitor) {
      this.router.use(require('express-status-monitor')());
    }

  }

  health(req, res) {
    res.json(XcUtils.getHealth(req.query));
  }


  downloadFile(req, res) {
    const sPath = path.join(process.cwd(),'server','public');
    const sFileName = path.normalize(req.query.name);
    const sFileToDownload = path.join(sPath, sFileName);
    if (sFileToDownload.startsWith(sPath))
      res.download(sFileToDownload);
    else
      res.status(400).json({
        msg: `Invalid file path ${req.query.name}`
      })
  }

  uploadFile(req, res) {
    if (req.file) {
      console.log(req.file.path);
      res.end(req.file.path);
    } else {
      res.end("upload failed");
    }
  }

  uploadFiles(req, res) {
    if (!req.files || req.files.length === 0) {
      res.end("upload failed");
    } else {
      let files = [];
      for (let i = 0; i < req.files.length; ++i) {
        files.push(req.files[i].path);
      }
      res.end(files.toString());
    }
  }

  get apisCount() {
    let apis = this.app.$router._router.stack.filter(r => r.route).length;
    return apis;
  }

  async init(app) {

    try {

      console.log('router.init()');

      app['$router'] = this.router;

      this.initMiddlewares();

      const crudRouters = []
      const crudMiddleware = app.$config.dbs.map(({meta: {dbAlias}}) => path.join(__dirname, dbAlias, '**'));

      /* load global middlewares */
      glob.sync(path.join(__dirname, '**', '*.middleware.js'), {ignore: crudMiddleware}).forEach(file => {
        const mw = require(file);
        app.$middlewares[mw.name] = new mw(app);
      });

      /* prepare CRUD routers and their middlewares */
      for (const {meta: {dbAlias}} of app.$config.dbs) {

        const miniRouters = this.miniRouters[dbAlias] = this.miniRouters[dbAlias] || {};
        const middlewares = app.$middlewares[dbAlias] = app.$middlewares[dbAlias] || {};

        const routesPath = path.join(__dirname, dbAlias, '**', '*.router.js');

        glob.sync(path.join(__dirname, dbAlias, '**', '*.middleware.js')).forEach(file => {
          const mw = require(file);
          middlewares[mw.name] = new mw(app);
        });

        glob.sync(routesPath).forEach(file => {
          const routerClass = require(file)
          miniRouters[routerClass.name] = new routerClass(app);
        });
        crudRouters.push(routesPath);
      }

      /* prepare non-CRUD routers and their middlewares ? */
      glob.sync(path.join(__dirname, '**', '*.router.js'), {ignore: crudRouters}).forEach(file => {
        const routerClass = require(file)
        this.miniRouters[routerClass.name] = new routerClass(app);
      });

      /* prepare swagger docs */
      if (this.app.$config.env === 'dev') {
        glob.sync(path.join(process.cwd(), 'server', 'tool', 'apis', 'swagger', '**', '*.swagger.json'), {ignore: crudRouters}).forEach(file => {
          const swaggerJson = require(file)
          swaggerDocument.tags.push(...swaggerJson.tags);
          Object.assign(swaggerDocument.paths, swaggerJson.paths);
          Object.assign(swaggerDocument.definitions, swaggerJson.definitions);
        });

        fs.writeFileSync(path.join(process.cwd(), 'server', 'tool', 'apis', 'swagger', 'swagger-autogenerated.json'), JSON.stringify(swaggerDocument, 0, 2));

        this.router.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
      }



      this.router.use((err, _req, res, next) => {
        // logic
        if (err) {
          return res.status(400).json({msg: err.message || err.msg});
        }
        next();
      });

    } catch (e) {
      console.log(e);
      throw e;
    }

  }


}


module.exports = Router;
