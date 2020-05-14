const {BaseMiddleware} = require('xc-core')

class authMiddleware extends BaseMiddleware {

  constructor(app) {
    super({app});
  }

  async default(req, res, next) {
    console.log('Auth middleware')
    next();
  }

}

module.exports = authMiddleware;