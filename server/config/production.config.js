module.exports = {
  "port" :8081,
  "siteUrl": "https://example.com/",
  "auth": {
    "google": {
      "clientID": "",
      "clientSecret": "",
      "callbackUrl": "https://example.com/api/v1/auth/google/callback"
    },
    "facebook": {
      "clientID": "",
      "clientSecret": "",
      "callbackUrl": "https://example.com/api/v1/auth/facebook/callback"
    }
  },
  "mailer": {
    "from": "xc<xc@xgene.cloud>",
    "options": {
      "host": "smtp.zoho.eu",
      "port": 465,
      "secure": true,
      "auth": {
        "user": "xc@xgene.cloud",
        "pass": ""
      }
    }
  }
}
