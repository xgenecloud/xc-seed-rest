const {BaseComponent} = require('xc-core');




class Mailer extends BaseComponent {

  constructor(app) {
    super(app)
    this.app  = app;

    // this.mailer = nodemailer.createTransport(this.config['envs']['dev'].mailer.options);
  }

  // eslint-disable-next-line no-unused-vars
  async init(app) {
    console.log('mailer.init()');
  }

  sendEmailPromise(options) {
    let _this = this;
    return new Promise(function (resolve, reject) {
      console.log(options);
      _this.mailer.sendMail(options, function (err, data) {
        if (err !== null) {
          console.log('error sending email..', err);
          return reject(err);
        } else {
          //console.log('sent email successfully..', data);
          resolve(data);
        }
      });
    })
  }

  async sendEmail() {

    const data = {
      to: 'naveen.mr@gmail.com',
      from: this.app.$config.mailer.from,
      subject: 'Mailer test',
      html: 'hello'
    };

    console.log('sending email');

    let err;
    try {
      err = await this.sendEmailPromise(data);
      console.log('sent email successfully', err);
    } catch (e) {
      err = e;
      console.log('caught an error', e);
    }

    return err;

  }


}


module.exports = Mailer;