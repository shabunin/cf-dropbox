var RL = {
  tokenName: 'log',
  debug: 1,
  // getSystems: function() {
  //   return JSON.stringify(CF.systems);
  // },
  // getAllJoins: function() {
  //   CF.getGuiDescription(function(gui) {
  //     CF.log(JSON.stringify(gui));
  //     CF.getJoins(gui.allJoins, function(joins) {
  //       return JSON.stringify(joins);
  //     });
  //   });
  // },
  log: function(text) {
    var that = this;
    CF.getJoin(CF.GlobalTokensJoin, function(j, v, tokens, tags) {
      var currentLog = tokens[that.tokenName];
      currentLog += text + '\r\n';
      CF.setToken(CF.GlobalTokensJoin, that.tokenName, currentLog);
    });
    CF.log(text);
  },
  clearLog: function() {
    var that = this;
    CF.setToken(CF.GlobalTokensJoin, that.tokenName, 0);
  },
  sendLog: function(path, uploadFunction, callback) {
    var that = RL;
    var fileName = path;
    var dateNow = new Date();
    fileName += '/log/' + Date.format(dateNow, 'dd-MM-yyyy_HH-mm.log');
    if(this.debug == 1) {
      CF.getJoin(CF.GlobalTokensJoin, function(j, v, tokens, tags) {
        var currentLog = tokens[that.tokenName];
        uploadFunction(fileName, currentLog, function() {
          callback();
        });
      });
    } else {
      callback();
    }
  },
};
