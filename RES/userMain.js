
var updateSettings = function(path) {
  RL.log('updateSettings: start');
  // get /path/settings.json file
  dropbox.requestFile(path + '/settings.json', function(file) {
    RL.log('updateSettings: request file settings.json success');
    var settings = JSON.parse(file);
    RL.debug = settings.debug;
    // send log if debug setting is 1 
    RL.sendLog(path, dropbox.uploadFile, function() {
      RL.log('updateSettings: upload log callback');
      // clear log after sending
      RL.clearLog();
      // check if update setting is set to yes
      if (settings.gui.update == 'yes') {
        var guiFile = settings.gui.file;
        // /media request, returns link https://dl.*
        // if there is no requested file then nothing happens
        // because in this case callback won't be called
        dropbox.requestMedia(path + '/' + guiFile, function(response) {
          RL.log('updateSettings request gui url success');
          var media = JSON.parse(response);
          if (media.url !== undefined) {          
            settings.gui.update = 'no';
            // change update setting to 'no' then upload settings
            // if file uploaded successful - update gui
            dropbox.uploadFile(path + '/settings.json', JSON.stringify(settings), function() {
              RL.log('updateSettings 5');
              CF.loadGUI(media.url , { reloadGUI: true, reloadAssets: true });
              RL.log('GUI Updated!');
            });
          }
        });
      }
    });
  });
};

CF.userMain = function() {
  RL.log('Starting cf-dropbox');
  // declare here function for dropbox module to save access
  // tokens that dropbox core api returns in gui tokens 
  dropbox.saveGlobalToken = function() {
    CF.setToken(CF.GlobalTokensJoin, 'access_token', dropbox.token['value']);
    CF.setToken(CF.GlobalTokensJoin, 'token_type', dropbox.token['type']);
  };
  // load gui tokens
  CF.getJoin(CF.GlobalTokensJoin, function(j, v, tokens, tags) {
    var accessToken = tokens['access_token'];
    var tokenType = tokens['token_type'];
    var currentLog = tokens['log'];
    var dropboxFolder = tokens['dropboxFolder'];
    var currentGuiName  = tokens['currentGuiName'];
    RL.log('Access token:' + accessToken);
    RL.log(dropboxFolder);

    // check if we have saved dropbox access token
    if(accessToken != 0) {
      dropbox.token['value'] = accessToken;
      dropbox.token['type'] = tokenType;
      updateSettings(dropboxFolder);
    } else {
      // else - show browser window 
      CF.setJoin('s1', dropbox.getAuthorizationUrl());
      CF.setJoin('d1', 1);
    }
    //CF.setToken(CF.GlobalTokensJoin, '[' + that.tokenName + ']', currentLog);
  });
	
  //simple http server to handle redirect from dropbox authorization page
	CF.watch(CF.FeedbackMatchedEvent, 'localhost5000server', 'localhost5000feedback', function(feedbackItem, matchedString) {
    //RL.log('localhost:5000 incoming message: ' + matchedString);
    var regex = /\?code=([^\s]*)/;
    var regexClose = /\/closeBrowser/;
    var regexAuth = /\/getAuthorization/;
 
    // check if redurect request contain code parameter
    var body = '';
    var headers = [];
    var response = '';
    if (regex.test(matchedString)) {
      var regarr = regex.exec(matchedString);
      var code = regarr[1];
      dropbox.application.authorizationCode = code;
      dropbox.requestToken();
      body = '<html><body>success!<br><form action="closeBrowser" method="get">' +
                  '<input type="submit" value="Close"></form></body></html>';

      headers = ['HTTP/1.1 200 OK', 'Content-Type: text/html','Content-Length: ' + body.length];
      response = headers.join('\r\n') + '\r\n\r\n' + body;
      CF.send('localhost5000server', response, CF.UTF8);

    } else {
      if (regexClose.test(matchedString)) {
        CF.setJoin('d1', 0);
      } else {
        if (regexAuth.test(matchedString)) {
          CF.setJoin('s1', dropbox.getAuthorizationUrl());
        } else {

          body = '<html><body>Authorization failed. to open authorization page press button<br>' +
                  '<form action="getAuthorization" method="get">' +
                  '<input type="submit" value="Try again"></form></body></html>';

          headers = ['HTTP/1.1 200 OK', 'Content-Type: text/html','Content-Length: ' + body.length];
          response = headers.join('\r\n') + '\r\n\r\n' + body;
          CF.send('localhost5000server', response, CF.UTF8);
        }
      }
    }
  });

  //CF.watch(CF.GUIResumedEvent, function() {});
};

