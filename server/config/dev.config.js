module.exports = {
  "port" :8080,
  "auth": {
    "google": {
      "clientID": "client_id",
      "clientSecret": "client_secret",
      "callbackUrl": "https://example.com/api/v1/auth/google/callback"
    },
    "facebook": {
      "clientID": "client_id",
      "clientSecret": "client_secret",
      "callbackUrl": "https://example.com/api/v1/auth/facebook/callback"
    }
  },
  "siteUrl": "http://localhost:8080/",
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
