const {BaseComponent} = require('xc-core');
const path = require('path');
const glob = require('glob');


class Services extends BaseComponent {
  
  constructor(app) {
    super(app);
  }
  
  
  async init(app) {
    
    console.log('services.init()');
    
    try {
      
      const crudServicePaths = []
      
      /* load crud services */
      for (const {meta:{dbAlias}} of app.$config.dbs) {
        
        let servicePath = path.join(__dirname, dbAlias, '**', '*.service.js');
        app.$services[dbAlias] = app.$services[dbAlias] || {};
        
        glob.sync(servicePath).forEach((file) => {
          let service = require(file);
          app.$services[dbAlias][service.name] = new service(app);
        });
        
        crudServicePaths.push(servicePath);
      }
      
      /* load non-crud services */
      glob.sync(path.join(__dirname, '**', '*.service.js'), {ignore: crudServicePaths}).forEach((file) => {
        let service = require(file)
        app.$services[service.name] = new service(app);
      });
      
    } catch (e) {
      console.log(e);
      throw e;
    }
    
    
  }
  
  
}


module.exports = Services;
