/* eslint-disable */
const {expect} = require('chai');
const request = require('supertest');
const session = require('supertest-session');
const {Components} = require('xc-core');


describe('{Auth, CRUD, HasMany, Belongs} Tests', function () {

  let app, appServer, httpSession, appContext;


  // Called once before any of the tests in this block begin.
  before(function (done) {
    (async () => {
      appContext = new Components(require('../app.config').config);
      await appContext.init();

      appContext.router.start();
      app = appContext.$router;
      appServer = appContext.$router.server;
      httpSession = session(app);

      // replacing email service with dummy object
      appContext.$services.AuthService.transporter = {
        sendMail(...args) {
          console.log(args)
        }
      }


    })().then(done).catch(done);
  });


  after(function (done) {
    if (appServer) appServer.close();
    done()
    process.exit();
  });


  /**************** START : Auth ****************/
  describe('Authentication', function () {

    const EMAIL_ID = 'abc@g.com'
    const VALID_PASSWORD = '1234566778';

    it('Signup with valid email', function (done) {
      this.timeout(10000)
      request(app)
        .post('/api/v1/auth/signup')
        .send({email: EMAIL_ID, password: VALID_PASSWORD})
        .expect(200, function (err, res) {
          if (err) {
            expect(res.statusCode).to.equal(500)
          } else {
            const email = res.body.email;
            expect(email).to.equal(EMAIL_ID);
          }
          done();
        });
    });

    it('Signup with invalid email', function (done) {
      request(app)
        .post('/api/v1/auth/signup')
        .send({email: 'test', password: VALID_PASSWORD})
        .expect(500, done);
    });

    it('Signin with valid credentials', function (done) {
      httpSession
        .post('/api/v1/auth/signin')
        .send({email: EMAIL_ID, password: VALID_PASSWORD})
        .expect(200, function (err, res) {
          if (err) {
            done(err);
          }
          const email = res.body.email;
          expect(email).to.equal(EMAIL_ID);
          // Done
          done();
        });
    });

    it('me', function (done) {
      httpSession
        .get('/api/v1/user/me')
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }
          const email = res.body.email;
          expect(email).to.equal(EMAIL_ID);
          done();
        });
    });


    it('Change password', function (done) {
      httpSession
        .post('/api/v1/user/password/change')
        .send({currentPassword: 'password', newPassword: 'password'})
        .expect(500, done);
    });


    it('Change password - after logout', function (done) {
      // todo:
      request(app)
        .post('/api/v1/user/password/change')
        .send({currentPassword: 'password', newPassword: 'password'})
        .expect(500, function (err, res) {
          done()
        });
    });


    it('Signout', function (done) {
      httpSession
        .get('/api/v1/auth/signout')
        .expect(200, function (err, res) {

          if (err) {
            return done(err);
          }

          httpSession
            .get('/api/v1/user/me')
            .expect(200, function (err, res) {
              if (err) {
                return done(err);
              }
              expect(res.body.email).to.equal(undefined);
              done();
            });

        });
    });


    it('Signin with invalid credentials', function (done) {
      request(app)
        .post('/api/v1/auth/signin')
        .send({email: 'abc@abc.com', password: VALID_PASSWORD})
        .expect(400, done);
    });

    it('Signin with invalid password', function (done) {
      request(app)
        .post('/api/v1/auth/signin')
        .send({email: EMAIL_ID, password: 'wrongPassword'})
        .expect(400, done);
    });


    it('Forgot password with a non-existing email id', function (done) {
      request(app)
        .post('/api/v1/auth/password/forgot')
        .send({email: 'abc@abc.com'})
        .expect(500, done);
    });

    it('Forgot password with an existing email id', function (done) {
      this.timeout(10000)
      request(app)
        .post('/api/v1/auth/password/forgot')
        .send({email: EMAIL_ID})
        .expect(200, done);
    });

    it('Email validate with an invalid token', function (done) {
      request(app)
        .post('/api/v1/auth/email/validate/someRandomValue')
        .send({email: EMAIL_ID})
        .expect(500, done);
    });

    it('Email validate with a valid token', function (done) {

      console.log('eeee')


      // todo :
      done();

      // request(app)
      //   .post('/api/v1/auth/email/validate/someRandomValue')
      //   .send({email: EMAIL_ID})
      //   .expect(500, done);
    });


    it('Forgot password validate with an invalid token', function (done) {
      request(app)
        .get('/api/v1/auth/token/validate/someRandomValue')
        .send({email: EMAIL_ID})
        .expect(500, done);
    });

    it('Forgot password validate with a valid token', function (done) {
      // todo

      done()

      // request(app)
      //   .post('/api/v1/auth/token/validate/someRandomValue')
      //   .send({email: EMAIL_ID})
      //   .expect(500, done);
    });


    it('Reset Password with an invalid token', function (done) {
      request(app)
        .post('/api/v1/auth/password/reset/someRandomValue')
        .send({password: 'anewpassword'})
        .expect(500, done);
    });

    it('Reset Password with an valid token', function (done) {
      //todo
      done()

      // request(app)
      //   .post('/api/v1/auth/password/reset/someRandomValue')
      //   .send({password: 'anewpassword'})
      //   .expect(500, done);
    });


  });
  /**************** END : Auth ****************/


});