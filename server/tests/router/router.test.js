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


  /**************** START : CRUD ****************/
  describe('CRUD', function () {
    const COUNTRY_ID = 9999;
    const COUNTRY_NAME = 'IN';
    this.timeout(5000);

    it('list + limit : GET - /api/v1/country?limit=6', function (done) {
      request(app)
        .get('/api/v1/country?limit=6')
        .expect(200, (err, res) => {
          if (err) done(err)
          expect(res.body.length).to.be.lessThan(7)
          done();
        });
    });

    it('list + where : GET - /api/v1/country?where=(country,like,b%)', function (done) {
      request(app)
        .get('/api/v1/country?where=(country,like,b%)')
        .expect(200, (err, res) => {
          if (err) done(err)
          expect(res.body).to.be.a('array');
          if (res.body.length) expect(res.body[0].country.toLowerCase()).to.be.a('string').and.satisfy(msg => {
            return msg.startsWith('b');
          }, 'Should start with "b"')
          done();
        });
    });

    it('list + sort : GET - /api/v1/country?sort=-country_id', function (done) {
      request(app)
        .get('/api/v1/country?sort=-country_id')
        .expect(200, (err, res) => {
          if (err) done(err)
          expect(res.body).to.be.a('array');
          expect(res.body).satisfy(array => {
            let i = array.length;
            while (--i) {
              if (array[i].country_id > array[i - 1].country_id) return false;
            }
            return true
          }, 'Should be in descending order')
          done();
        });
    });

    it('list + fields : GET - /api/v1/country?fields=country,country_id', function (done) {
      request(app)
        .get('/api/v1/country?fields=country,country_id')
        .expect(200, (err, res) => {
          if (err) done(err)
          expect(res.body).to.be.a('array');
          expect(Object.keys(res.body[0]).length).to.be.equal(2);
          expect(res.body[0]).to.have.all.keys('country_id', 'country');
          done();
        });
    });

    it('list + offset : GET - /api/v1/country?offset=0', function (done) {

      request(app)
        .get('/api/v1/country?offset=0&limit=6')
        .expect(200, (err, res1) => {
          if (err) done(err)
          request(app)
            .get('/api/v1/country?offset=1&limit=5')
            .expect(200, (err, res2) => {
              if (err) done(err)
              expect(res2.body).satisfy(arr => arr.every(({country, country_id}, i) =>
                country === res1.body[i + 1].country && country_id === res1.body[i + 1].country_id
              ), 'Both data should need to be equal where offset vary with 1')
              done();
            });
        });
    });

    describe('CRUD', function () {
      it('create - POST - /api/v1/country', function (done) {
        request(app)
          .delete('/api/v1/country/' + COUNTRY_ID)
          .expect(200, (err, res) => {
            request(app)
              .post('/api/v1/country')
              .send({country: COUNTRY_NAME, country_id: COUNTRY_ID})
              .expect(200, (err, res) => {
                if (err) done(err)
                expect(res.body).to.be.a('object');
                expect(res.body.country).to.be.equal(COUNTRY_NAME);
                done();
              })
          });
      });


      it('read - GET - /api/v1/country/:id', function (done) {
        request(app)
          .get('/api/v1/country/1')
          .expect(200, (err, res) => {
            if (err) done(err)
            // expect(res.body).to.be.a('array');
            expect(res.body).to.be.a('object');
            expect(res.body.country).to.be.equal('Afghanistan');
            done();
          })
      });

      it('update - PUT - /api/v1/country/:id', function (done) {
        request(app)
          .put('/api/v1/country/' + COUNTRY_ID)
          .send({country: COUNTRY_NAME + 'a'})
          .expect(200, (err, res) => {
            if (err) done(err)
            expect(res.body).to.be.equal(1);
            request(app)
              .get('/api/v1/country/' + COUNTRY_ID)
              .expect(200, (err, res) => {
                if (err) done(err)
                expect(res.body).to.be.a('object');
                expect(res.body.country).to.be.equal(COUNTRY_NAME + 'a');
                done();
              })
          })
      });

      it('exists - PUT - /api/v1/country/:id/exists', function (done) {
        request(app)
          .get(`/api/v1/country/1/exists`)
          .expect(200, (err, res) => {
            if (err) done(err)
            expect(res.body).to.be.true;
            done();
          })
      });

      it('findOne - GET - /api/v1/country/findOne', function (done) {
        request(app)
          .get(`/api/v1/country/findOne?where=(country,eq,${COUNTRY_NAME + 'a'})`)
          .expect(200, (err, res) => {
            if (err) done(err)
            expect(res.body).to.be.a('object');
            expect(res.body.country).to.be.equal(COUNTRY_NAME + 'a');
            done();
          });
      })

      it('delete - DELETE - /api/v1/country/:id', function (done) {
        request(app)
          .delete('/api/v1/country/' + COUNTRY_ID)
          .expect(200, (err, res) => {
            if (err) done(err)
            expect(res.body).to.be.equal(1);
            request(app)
              .get('/api/v1/country/' + COUNTRY_ID)
              .expect(200, (err, res) => {
                if (err) done(err)
                expect(res.body).to.be.a('object');
                expect(Object.keys(res.body)).to.have.length(0);
                done();
              })
          })
      });

    })


    it('groupBy - GET - /api/v1/country/groupby/:columnName', function (done) {
      request(app)
        .get(`/api/v1/country/groupby/country?limit=5`)
        .expect(200, (err, res) => {
          if (err) done(err)
          expect(res.body).to.be.a('array');
          if (res.body.length) {
            expect(res.body.length).to.be.most(5);
            expect(res.body[0].count).to.be.greaterThan(0);
            expect(res.body[0].country).to.be.a('string');
            expect(Object.keys(res.body[0]).length).to.be.equal(2);
          }
          done();
        });
    })


    it('groupBy multiple - GET - /api/v1/country/groupby/:columnName', function (done) {
      request(app)
        .get(`/api/v1/country/groupby/country?fields=country_id&limit=5`)
        .expect(200, (err, res) => {
          if (err) done(err)
          expect(res.body).to.be.a('array');
          expect(res.body.length).to.be.most(5);
          if (res.body.length) {
            expect(res.body[0].count).to.be.greaterThan(0);
            expect(res.body[0].country).to.be.a('string');
            expect(res.body[0].country_id).to.be.a('number');
            expect(Object.keys(res.body[0]).length).to.be.equal(3);
          }
          done();
        });
    })

    it('distribution - GET - /api/v1/country/distribution/:columnName', function (done) {
      request(app)
        .get(`/api/v1/country/distribution/country_id`)
        .expect(200, (err, res) => {
          if (err) done(err)
          expect(res.body).to.be.a('array');
          expect(res.body[0].count).to.be.a('number');
          expect(res.body[0].count).satisfies(num => num === parseInt(num) && num >= 0, 'should be a positive integer');
          expect(res.body[0].range).to.be.a('string');
          expect(res.body[0].range).to.be.match(/^\d+-\d+$/, 'should match {num start}-{num end} format')
          done();
        });
    })


    it('distinct - GET - /api/v1/country/distinct/:columnName', function (done) {
      request(app)
        .get(`/api/v1/country/distinct/country?limit=5`)
        .expect(200, (err, res) => {
          if (err) done(err)
          expect(res.body).to.be.a('array');
          if (res.body.length) {
            expect(res.body[0].country).to.be.a('string');
            expect(Object.keys(res.body[0]).length).to.be.equal(1);
          }
          expect(res.body.length).to.be.most(5);
          done();
        });
    })

    it('distinct multiple - GET - /api/v1/country/distinct/:columnName', function (done) {
      request(app)
        .get(`/api/v1/country/distinct/country?fields=country_id&limit=5`)
        .expect(200, (err, res) => {
          if (err) done(err)
          expect(res.body).to.be.a('array');
          if (res.body.length) {
            expect(res.body[0].country).to.be.a('string');
            expect(Object.keys(res.body[0]).length).to.be.equal(2);
          }
          expect(res.body.length).to.be.most(5);
          done();
        });
    })

    it('aggregate - GET - /api/v1/country/aggregate/:columnName', function (done) {
      request(app)
        .get(`/api/v1/country/aggregate/country_id?func=sum,avg,min,max,count`)
        .expect(200, (err, res) => {
          if (err) done(err)
          expect(res.body).to.be.a('array');
          if (res.body.length) {
            expect(res.body[0].min).to.be.a('number');
            expect(res.body[0].max).to.be.a('number');
            expect(res.body[0].avg).to.be.a('number');
            expect(res.body[0].sum).to.be.a('number');
            expect(res.body[0].count).to.be.a('number').and.satisfy(num => num === parseInt(num), 'count should be an integer');
            expect(Object.keys(res.body[0]).length).to.be.equal(5);
          }
          expect(res.body.length).to.be.most(5);
          done();
        });
    })


    it('count - GET - /api/v1/country/count', function (done) {
      request(app)
        .get(`/api/v1/country/count`)
        .expect(200, (err, res) => {
          if (err) done(err)
          expect(res.body).to.be.a('object');
          expect(res.body.count).to.be.a('number').and.satisfy(num => num === parseInt(num), 'count should be an integer');
          ;
          done();
        });
    })


    it('bulk insert - POST - /api/v1/country/bulk', function (done) {
      request(app)
        .post(`/api/v1/country/bulk`)
        .send([
          {country: 'a'},
          {country: 'b'},
          {country: 'c'},
          {country: 'd'},
          {country: 'e'},
        ])
        .expect(200, (err, res) => {
          if (err) done(err)
          expect(res.body).to.be.a('array');
          expect(res.body[0]).to.be.a('number');
          request(app)
            .get(`/api/v1/country/${res.body.pop()}`)
            .expect(200, (err, res) => {
              if (err) done(err)
              // expect(res.body).to.be.a('array');
              expect(res.body).to.be.a('object');
              expect(res.body.country).to.be.equal('a');
              done()
            })
        });
    })


    it('bulk update - PUT - /api/v1/country/bulk', function (done) {
      // get last inserted 5 entry by sorting db data in reverse order based on id
      request(app)
        .get('/api/v1/country?sort=-country_id&limit=5')
        .expect(200, (err, res) => {
          if (err) done(err);


          expect(res.body).to.be.a('array');
          expect(res.body[0]).to.be.a('object');
          expect(res.body[0].country).to.be.a('string');


          request(app)
            .put(`/api/v1/country/bulk`)
            .send(
              res.body.map(({country, country_id}) => ({
                country_id,
                country: country + 1
              }))
            )
            .expect(200, (err, res) => {
              if (err) done(err)
              expect(res.body).to.be.a('array');
              expect(res.body[0]).to.be.a('number');
              expect(res.body[0]).to.be.equal(1);
              expect(res.body.length).to.be.equal(5);
              done()
            });
        })
    })

    it('bulk delete - DELETE - /api/v1/country/bulk', function (done) {
      // get last inserted 5 entry by sorting db data in reverse order based on id
      request(app)
        .get('/api/v1/country?sort=-country_id&limit=5')
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body).to.be.a('array');
          expect(res.body[0]).to.be.a('object');
          expect(res.body[0].country).to.be.a('string');

          request(app)
            .delete(`/api/v1/country/bulk`)
            .send(
              res.body.map(({country, country_id}) => ({country_id}))
            )
            .expect(200, (err, res) => {
              if (err) done(err)
              expect(res.body).to.be.a('array');
              expect(res.body[0]).to.be.a('number');
              expect(res.body[0]).to.be.equal(1);
              expect(res.body.length).to.be.equal(5);
              done()
            });
        })
    })

  });
  /**************** END : CRUD ****************/


  /**************** START : hasMany ****************/
  describe('Country HasMany City Api', function () {
    const CITY_NAME = 'testCity', CITY_ID = 9999;

    it('has city - GET - /api/v1/country/has/city(:childs)?', function (done) {
      // get last inserted 5 entry by sorting db data in reverse order based on id
      request(app)
        .get('/api/v1/country/has/city')
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body).to.be.a('array');
          expect(res.body[0]).to.be.a('object');
          expect(res.body[0].country).to.be.a('string');
          expect(res.body[0].city).to.be.a('array');
          expect(res.body[0].city[0]).to.be.a('object');
          expect(res.body[0].city[0].city).to.be.a('string');
          done();
        })
    })

    it('cities under a single parent - GET - /api/v1/country/:parentId/city', function (done) {
      // get last inserted 5 entry by sorting db data in reverse order based on id
      request(app)
        .get('/api/v1/country/1/city?limit=5')
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body).to.be.a('array');
          expect(res.body[0]).to.be.a('object');
          expect(res.body[0].city).to.be.a('string');
          expect(res.body.length).to.be.most(5);
          done();
        })
    })


    it('create - POST - /api/v1/country/:parentId/city/:id', function (done) {
      request(app)
        .delete(`/api/v1/country/1/city/${CITY_ID}`)
        .expect(200, (err, res) => {
          request(app)
            .post(`/api/v1/country/1/city`)
            .send({city: CITY_NAME, city_id: CITY_ID})
            .expect(200, (err, res) => {
              if (err) done(err);
              expect(res.body).to.be.a('object')
              expect(res.body.city).to.be.equal(CITY_NAME);
              expect(res.body.country_id + "").to.be.equal("1");
              done();
            });
        });
    });

    it('get city by id - GET - /api/v1/country/:parentId/city/:id', function (done) {
      request(app)
        .get(`/api/v1/country/1/city/${CITY_ID}`)
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body).to.be.a('array')
          expect(res.body[0].city).to.be.equal(CITY_NAME);
          expect(res.body[0].country_id).to.be.equal(1);
          done();
        });
    });

    it('get count - GET - /api/v1/country/:parentId/city/count', function (done) {
      request(app)
        .get(`/api/v1/country/1/city/count`)
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body).to.be.a('object')
          expect(res.body.count).to.be.a('number');
          done();
        });
    });


    it('update - PUT - /api/v1/country/:parentId/city/:id', function (done) {
      request(app)
        .put(`/api/v1/country/1/city/${CITY_ID}`)
        .send({city: CITY_NAME + 'a'})
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body).to.be.equal(1)
          request(app)
            .get(`/api/v1/country/1/city/${CITY_ID}`)
            .expect(200, (err, res) => {
              if (err) done(err);
              expect(res.body).to.be.a('array')
              expect(res.body[0].city).to.be.equal(CITY_NAME + 'a');
              expect(res.body[0].country_id).to.be.equal(1);
              done();
            });
        });
    });


    it('findOne city - GET - /api/v1/country/:parentId/city/findOne', function (done) {
      request(app)
        .get(`/api/v1/country/1/city/findOne?where=(city,eq,${CITY_NAME + 'a'})`)
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body).to.be.a('object')
          expect(res.body.city).to.be.equal(CITY_NAME + 'a');
          expect(res.body.country_id + "").to.be.equal("1");
          done();
        });
    });


    it('exists city - GET - /api/v1/country/1/city/${CITY_ID}/exists', function (done) {
      request(app)
        .get(`/api/v1/country/1/city/${CITY_ID}/exists`)
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body).to.be.true
          done();
        });
    });

    it('delete - DELETE - /api/v1/country/:parentId/city', function (done) {
      request(app)
        .delete(`/api/v1/country/1/city/${CITY_ID}`)
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body).to.be.equal(1)
          done();
        });
    });

  })
  /**************** END : hasMany ****************/

  /**************** START : belongsTo ****************/
  describe('City BelngsTo Country Api', function () {

    it('has city - GET - /api/v1/country/has/city(:childs)?', function (done) {
      // get last inserted 5 entry by sorting db data in reverse order based on id
      request(app)
        .get('/api/v1/city/belongs/country?limit=5')
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body).to.be.a('array');
          expect(res.body[0]).to.be.a('object');
          expect(res.body[0].city).to.be.a('string');
          expect(res.body[0].country).to.be.a('object');
          expect(res.body.length).to.be.most(5)
          done();
        })
    })
  });
  /**************** END : belongsTo ****************/


});