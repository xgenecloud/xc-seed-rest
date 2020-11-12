/* eslint-disable no-unused-vars */
const {BaseService, XcUtils} = require('xc-core');
const passport = require('passport');
const Strategy = require('./strategies');
const util = require('util')
const nodemailer = require('nodemailer');

const bcrypt = require('bcryptjs');

const uuidv4 = require('uuid/v4');
const validator = require('validator');


class AuthService extends BaseService {

  constructor(app) {
    super(app);
    this.users = app.$dbs.primary.users;
    new Strategy({app})
    this.transporter = nodemailer.createTransport(app.$config.mailer.options);
  }


  async signin(req, res, next) {

    passport.authenticate('local', async (err, user, info) => {

      try {

        if (!user || !user.email) {

          if (err) {
            return res.status(400).send(err)
          }

          if (info) {
            return res.status(400).send(info)
          }

          return res.status(400).send({msg: 'Your signin has failed'});

        }

        await util.promisify(req.login.bind(req))(user);

        res.json(req.session.passport.user)

      } catch (e) {
        console.log(e);
        throw e;
      }

    })(req, res, next);

  }

  async signup(req, res, next) {


    let user = await this.users.findOne({where: `(email,eq,${req.body.email})`});

    if (user && user.email) {
      throw new Error(`Email '${req.body.email}' already registered`)
    }

    if (!validator.isEmail(req.body.email)) {
      throw new Error( `Invalid email`)
    }

    user = await this.users.insert(req.body);

    user = await this.users.findOne({where: `(email,eq,${req.body.email})`});

    try {
      await this.transporter.sendMail({
        from: this.app.$config.mailer.from,
        to: user.email,
        subject: "Verify Email",
        text: `Verify your email by visiting following link : ${this.app.$config.siteUrl}email/verify/${user.email_verification_token}.`,
      })
    } catch (e) {
      // throw e;
      console.log('SMTP SendMail error : ',e.message);
    }
    await util.promisify(req.login.bind(req))(user);
    return req.session.passport.user;

  }

  async signout(req, res) {
    req.session.destroy();
    return {msg: 'Logged out'};
  }

  async passwordForgot(req, res) {
    try {

      let email = req.body.email;
      if (!email) {
        throw new Error('Please enter your email address.')
      }

      let user = await this.users.findOne({where: `(email,eq,${email})`});
      if (!user || !user.email) {
        throw new Error('This email is not registered with us.')
      }

      const token = uuidv4();

      user.reset_password_token = token;
      user.reset_password_expires = new Date(Date.now() + (60 * 60 * 1000))

      await this.users.updateByPk(user.id + '', user);
      try {
        await this.transporter.sendMail({
          from: this.app.$config.mailer.from,
          to: user.email,
          subject: "Password Reset Link",
          text: `Visit following link to update your password : ${this.app.$config.siteUrl}user/password/reset?token=${token}.`,
        })
      } catch (e) {
        // throw e;
        console.log('SMTP SendMail error : ',e.message);
      }
      return {msg: 'Check your email for password reset link.'};

    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async tokenValidate(req, res) {

    const token = req.params.tokenId;
    const user = await this.users.findOne({where: `(reset_password_token,eq,${token})`});
    if (!user || !user.email) {
      throw new Error('Invalid reset url');
    }
    if (user.reset_password_expires < new Date()) {
      throw new Error('Password reset url expired');
    }
    if (user.provider && user.provider !== 'local') {
      throw new Error('Email registered via social account');
    }
    return true

  }

  async emailValidate(req) {
    try {
      const token = req.params.tokenId;
      const user = await this.users.findOne({where: `(email_verification_token,eq,${token})`});
      if (!user || !user.email) {
        throw new Error('Invalid verification url');
      }

      user.email_verification_token = '';
      user.email_verified = true;
      await this.users.updateByPk(user.id, user);

      if (req.isAuthenticated()) {
        await util.promisify(req.login.bind(req))(user);
      }

      return {msg: 'Email verified successfully'};
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async tokenReset(req) {
    try {
      const token = req.params.tokenId;
      const user = await this.users.findOne({where: `(reset_password_token,eq,${token})`});
      if (!user || !user.email) {
        throw new Error('Invalid reset url');
      }
      if (user.reset_password_expires < new Date()) {
        throw new Error('Password reset url expired');
      }
      if (user.provider && user.provider !== 'local') {
        throw new Error('Email registered via social account');
      }

      user.salt = null;
      user.password = req.body.password;
      user.reset_password_expires = null;
      user.reset_password_token = '';

      await this.users.updateByPk(user.id, user);

      await util.promisify(req.login.bind(req))(user);
      user.salt = null;
      user.password = null;

      return user;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async passwordChange(req, res) {

    const {currentPassword, newPassword} = req.body;
    if (req.isAuthenticated()) {

      const user = await this.users.findOne({where: `(email,eq,${req.user.email})`});
      const hashedPassword = await XcUtils.getBCryptHash(bcrypt, currentPassword, user.salt);
      if (hashedPassword !== user.password) {
        throw new Error('Current password is wrong');
      }

      user.salt = null;
      user.password = newPassword;
      await this.users.updateByPk(user.id, user);

      return {msg: 'Password updated successfully'}

    }
  }


  async me(req, res) {
    return {msg: 'Not implemeneted'};
  }

  async oauth(req, res) {
    return {msg: 'Not implemeneted'};
  }

  async oauthCallback(req, res) {
    return {msg: 'Not implemeneted'};
  }


  // async list(req, res) {
  //   let data = await this.user.list(req.query);
  //   return data;
  // }
  //
  // async create(req, res) {
  //   let data = await this.user.insert(req.body);
  //   return data;
  // }
  //
  // async read(req, res) {
  //   let data = await this.user.readByPk(req.params.id);
  //   return data;
  // }
  //
  // async update(req, res) {
  //   let data = await this.user.updateByPk(req.params.id, req.body);
  //   return data;
  // }
  //
  // async delete(req, res) {
  //   let data = await this.user.deleteByPk(req.params.id);
  //   return data;
  // }
  //
  // async count(req, res) {
  //   let data = await this.user.countByPk(req.query);
  //   return data;
  // }
  //
  // async exists(req, res) {
  //   let data = await this.user.exists(req.params.id);
  //   return data;
  // }
  //
  // async groupBy(req, res) {
  //   let data = await this.user.groupBy({
  //     ...req.params,
  //     ...req.query
  //   });
  //   return data;
  // }
  //
  // async aggregate(req, res) {
  //   let data = await this.user.aggregate({
  //     ...req.params,
  //     ...req.query
  //   });
  //   return data;
  // }
  //
  // async distribution(req, res) {
  //   let data = await this.user.distribution({
  //     ...req.params,
  //     ...req.query
  //   });
  //   return data;
  // }
  //
  // async distinct(req, res) {
  //   let data = await this.user.distinct({
  //     ...req.params,
  //     ...req.query
  //   });
  //   return data;
  // }
  //
  // async findOne(req, res) {
  //   let data = await this.user.findOne(req.query);
  //   return data;
  // }
  //
  // async createb(req, res) {
  //   let data = await this.user.insertb(req.body);
  //   return data;
  // }
  //
  // async updateb(req, res) {
  //   let data = await this.user.updateb(req.body);
  //   return data;
  // }
  //
  // async deleteb(req, res) {
  //   let data = await this.user.deleteb(req.body);
  //   return data;
  // }

}

module.exports = AuthService;