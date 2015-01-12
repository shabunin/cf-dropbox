var dropbox = { 
  application: {
    key: '---',
    secret: '---',
    redirectUri: 'http://localhost:5000/',
    responseType: 'code',
    grantType: 'authorization_code',
    authorizationCode: '',
  },
  token: {
    value: '',
    type: '',
    uid: '',
  },
  debug: 1,
  
  log: function(text) {
    if (this.debug == 1) {
      RL.log("Dropbox Client: " + text);
    }
  },
  getAuthorizationUrl: function() {
    var url = 'https://www.dropbox.com/1/oauth2/authorize';
    url += '?client_id=' + this.application.key;
    url += '&redirect_uri=' + this.application.redirectUri;
    url += '&response_type=' + this.application.responseType;
    this.log('AuthorizationUrl: ' + url);
    return url; 
  },
  requestToken: function() {
    var that = this;
    var url = 'https://api.dropbox.com/1/oauth2/token';
    var method = 'POST';
    var headers = {
      'User-Agent' : 'iViewer/4',
    };
    var postContent = {
        code: this.application.authorizationCode,
        grant_type: this.application.grantType,
        client_id: this.application.key,
        client_secret: this.application.secret,
        redirect_uri: this.application.redirectUri,
      };
    this.log(JSON.stringify(postContent));

    CF.request(url, method, headers, postContent, function(status, headers, body) {
      if(status == 200) {
        that.parseToken(body);
      }
    });
  },
  requestAccountInfo: function() {
    var that = this;
    var url = 'https://api.dropbox.com/1/account/info';
    var method = 'GET';
    var headers = {
      'User-Agent' : 'iViewer/4',
      'Authorization' : 'Bearer ' + that.token.value,
    };
    CF.request(url, method, headers, function(status, headers, body) {
      that.log(body);
    });
  },
  requestMetadata: function(path) {
    var that = this;
    var url = 'https://api.dropbox.com/1/metadata/auto';
    if (path !== undefined) {
      url += path;
    } else {
      url += '/';
    }
    var method = 'GET';
    var headers = {
      'User-Agent' : 'iViewer/4',
      'Authorization' : 'Bearer ' + that.token.value,
    };
    CF.request(url, method, headers, function(status, headers, body) {
      that.log(body);
    });
  },
  requestFile: function(path, callback) {
    var that = dropbox;
    var url = 'https://api-content.dropbox.com/1/files/auto' + path;
    var method = 'GET';
    var headers = {
      'User-Agent' : 'iViewer/4',
      'Authorization' : 'Bearer ' + that.token.value,
    };
    CF.request(url, method, headers, function(status, headers, body) {
      if (status == 200) {
        callback(body);
      } else {
        that.log('request file error:' + status + '\n' + body);
      }
    });
  },
  requestMedia: function(path, callback) {
    var that = dropbox;
    var url = 'https://api.dropbox.com/1/media/auto' + path;
    var method = 'GET';
    var headers = {
      'User-Agent' : 'iViewer/4',
      'Authorization' : 'Bearer ' + that.token.value,
    };
    CF.request(url, method, headers, function(status, headers, body) {
      if (status == 200) {
        callback(body);
      } else {
        that.log('request file error:' + status + '\n' + body);
      }
    });
  },
  uploadFile: function(path, data, callback) {
    var that = dropbox;
    var url = 'https://api-content.dropbox.com/1/files_put/auto' + path;
    var method = 'PUT';
    var headers = {
      'User-Agent' : 'iViewer/4',
      'Authorization' : 'Bearer ' + that.token.value,
    };
    CF.request(url, method, headers, data, function(status, headers, body) {
      if(status == 200) {
        if (callback!== undefined) {
          callback();
        }
        that.log('file ' + path + ' uploaded with success');
      } else {
        that.log('Error uploading file ' + status);
      }
    });
  },
  saveGlobalToken: function() {
    //define in userMain
  },
  parseToken: function(response) {
    var token = JSON.parse(response);
    this.token['value'] = token.access_token;
    this.token['type'] = token.token_type;
    this.log('Your access token is:' + token.access_token);
    this.log('Please save it in global token manager otherwise after gui update token will be cleared');
    this.saveGlobalToken();
  }
};
