const {BaseRouter} = require('xc-core');
const passport = require('passport');

class AuthRouter extends BaseRouter {

  constructor(app) {
    super(app);
    this.AuthService = app.$services.AuthService;
    this._mapRoutes(app.$router);
  }

  async signin(req, res, next) {
    await this.AuthService.signin(req, res, next);
  }

  async signup(req, res, next) {
    console.log('sdsds')
    let data = await this.AuthService.signup(req, res, next);
    res.json(data);
  }

  async signout(req, res) {
    let data = await this.AuthService.signout(req, res);
    res.json(data);
  }

  async passwordForgot(req, res) {
    let data = await this.AuthService.passwordForgot(req, res);
    res.json(data);
  }

  async tokenValidate(req, res) {
    let data = await this.AuthService.tokenValidate(req, res);
    res.json(data);
  }

  async emailValidate(req, res) {
    let data = await this.AuthService.emailValidate(req, res);
    res.json(data);
  }

  async passwordReset(req, res) {
    let data = await this.AuthService.tokenReset(req, res);
    res.json(data);
  }
  async passwordChange(req, res) {
    let data = await this.AuthService.passwordChange(req, res);
    res.json(data);
  }

  async me(req, res) {
    res.json(req.user || {})
  }

  get router() {
    return this._router;
  }

  middleware(req, res, next) {
    console.log('User Middleware');
    next();
  }

  _mapRoutes(router) {

    /**************** Email authentication ****************/
    router.post('/api/v1/auth/signin', this.catchErr(this.signin));
    router.post('/api/v1/auth/signup', this.catchErr(this.signup));
    router.get('/api/v1/auth/signout', this.catchErr(this.signout));
    router.post('/api/v1/auth/password/forgot', this.catchErr(this.passwordForgot));
    router.get('/api/v1/auth/email/validate/:tokenId', this.catchErr(this.emailValidate));
    router.get('/api/v1/auth/token/validate/:tokenId', this.catchErr(this.tokenValidate));
    router.post('/api/v1/auth/password/reset/:tokenId', this.catchErr(this.passwordReset));
    router.get('/api/v1/user/me', this.catchErr(this.me));
    router.post('/api/v1/user/password/change', this.catchErr(this.passwordChange));
    router.put('/api/v1/user', this.catchErr(this.update));

    /**************** google auth ****************/
    router.get('/api/v1/auth/google',
      (req, res, next) => {
        if (req.query && req.query.redirect_to) {
          req.session.redirect_to = req.query.redirect_to;
        }
        next();
      },
      passport.authenticate('google', {scope: ['profile', 'email']
        // ,callbackURL:'http://localhost:8080/api/v1/auth/google/callback'
      }));

    router.get('/api/v1/auth/google/callback',
      passport.authenticate('google', {failureRedirect: '/login'}),
      (req, res) => {
        let redirectTo = '/api/v1/user/me';
        if (req.session && req.session.redirect_to) {
          redirectTo = req.session.redirect_to;
          delete req.session.redirect_to
        }
        res.redirect(redirectTo);
      });


    /**************** facebook auth ****************/
    router.get('/api/v1/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

    router.get('/api/v1/auth/facebook/callback',
      passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/login'
      }));

    // router.delete('/api/v1/user/accounts', this.catchErr(this.removeOAuthProvider.bind(this.controller));
    // router.post('/api/v1/user/password', this.catchErr(this.changePassword.bind(this.controller));
    // router.post('/api/v1/user/picture', this.catchErr(this.changeProfilePicture.bind(this.controller));

    // router.get('/api/v1/user', this.catchErr(this.list))
    // router.get('/api/v1/user/findOne', this.catchErr(this.findOne))
    // router.get('/api/v1/user/groupby/:columnName', this.catchErr(this.groupBy))
    // router.get('/api/v1/user/distribution/:columnName', this.catchErr(this.distribution))
    // router.get('/api/v1/user/distinct/:columnName', this.catchErr(this.distinct))
    // router.get('/api/v1/user/aggregate/:columnName', this.catchErr(this.aggregate))
    // router.get('/api/v1/user/count', this.catchErr(this.count));
    // router.post('/api/v1/user/bulk', this.catchErr(this.createb))
    // router.put('/api/v1/user/bulk', this.catchErr(this.updateb))
    // router.delete('/api/v1/user/bulk', this.catchErr(this.deleteb))
    // router.get('/api/v1/user/:id', this.catchErr(this.read))
    // router.put('/api/v1/user/:id', this.catchErr(this.update))
    // router.delete('/api/v1/user/:id', this.catchErr(this.delete))
    // router.get('/api/v1/user/:id/exists', this.catchErr(this.exists))

  }

  async list(req, res) {
    let data = await this.AuthService.list(req, res);
    res.json(data);
  }

  async create(req, res) {
    let data = await this.AuthService.create(req, res);
    res.json(data);
  }

  async update(req, res) {
    let data = await this.AuthService.update(req, res);
    res.json(data);
  }

  async delete(req, res) {
    let data = await this.AuthService.delete(req, res);
    res.json(data);
  }

  async createb(req, res) {
    let data = await this.AuthService.createb(req, res);
    res.json(data);
  }

  async updateb(req, res) {
    let data = await this.AuthService.updateb(req, res);
    res.json(data);
  }

  async deleteb(req, res) {
    let data = await this.AuthService.deleteb(req, res);
    res.json(data);
  }

  async read(req, res) {
    let data = await this.AuthService.read(req, res);
    res.json(data);
  }

  async count(req, res) {
    let data = await this.AuthService.count(req, res);
    res.json(data);
  }

  async exists(req, res) {
    let data = await this.AuthService.exists(req, res);
    res.json(data);
  }

  async groupBy(req, res) {
    let data = await this.AuthService.groupBy(req, res);
    res.json(data);
  }

  async aggregate(req, res) {
    let data = await this.AuthService.aggregate(req, res);
    res.json(data);
  }

  async distribution(req, res) {
    let data = await this.AuthService.distribution(req, res);
    res.json(data);
  }

  async distinct(req, res) {
    let data = await this.AuthService.distinct(req, res);
    res.json(data);
  }

  async findOne(req, res) {
    let data = await this.AuthService.findOne(req, res);
    res.json(data);
  }

}

module.exports = AuthRouter;