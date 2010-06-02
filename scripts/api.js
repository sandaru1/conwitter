Conwitter.API = function() {
  this.init();
}

$.extend(Conwitter.API.prototype,{
  init: function() {
    this.loading = 0;
  },
  
  setUser: function(url,params,type) {
      params.oauth_signature_method = 'HMAC-SHA1';
      var message = {
        method: type,
        parameters: params,
        action: url
      };

      OAuth.completeRequest(message, Conwitter.OAuth);
      return OAuth.getParameterMap(message.parameters);
  },
  
  ajaxRequest: function(url,params,callback,type,json) {
    var f = (type=="GET"?$.get:$.post);
    var temp_params = jQuery.extend(true, {}, params);

    f(url,this.setUser(url,temp_params,type),function(data,textStatus) {
        if (textStatus=="success") {
          if (json) {
            callback(JSON.parse(data)); 
          } else {
            callback(OAuth.getParameterMap(data));
          }
        }
      });
  },
  
  requestToken: function() {
    this.ajaxRequest(Conwitter.URL.REQUEST_TOKEN,{},this.authorize.bind(this),"POST",false);
  },
  
  authorize: function(data) {
    Conwitter.OAuth.token = data.oauth_token;
    Conwitter.OAuth.tokenSecret = data.oauth_token_secret;
    var url = Conwitter.URL.AUTHORIZE+"?oauth_token="+data.oauth_token;
    chrome.tabs.create({url:url,selected:true});
  },
  
  verifyToken: function(pin,callback) {
    this.ajaxRequest(Conwitter.URL.ACCESS_TOKEN,{oauth_verifier:pin},this.saveTokens.bind(this,callback),"POST",false);
  },
  
  saveTokens: function(callback,data) {
    Conwitter.OAuth.token = data.oauth_token;
    Conwitter.OAuth.tokenSecret = data.oauth_token_secret;
    for(var i in data) {
      localStorage[i] = data[i];
    }
    callback();
  },
  
  nextPage: function(url,params,callback,page,data) {
    if (params['since_id']!=null) {
      if (data.length==params['count'] && data[data.length-1].id>params['since_id']) {
        params['page'] = page+1;
        this.ajaxRequest(url,params,this.nextPage.bind(this,url,params,callback,page+1),"GET",true);
      }
    }
    callback(data);
  },
  
  callTimeline: function(url,last_id,max_id,callback) {
    var params = {count:Conwitter.Options.Count};
    if (last_id!=null) {
      params['since_id'] = last_id;
    }
    if (max_id!=null) {
      params['max_id'] = max_id;
    }

    this.ajaxRequest(url,params,this.nextPage.bind(this,url,params,callback,1),"GET",true);
  },
  
  homeTweets: function(last_id,callback) {
    this.callTimeline(Conwitter.URL.HOME,last_id,null,callback);
  },

  oldHomeTweets: function(max_id,callback) {
    var _this = this;
    this.loading++;
    this.callTimeline(Conwitter.URL.HOME,null,max_id,function(data) {
        _this.loading--;
        callback(data);
      });
  },
  
  mentionsTweets: function(last_id,callback) {
    this.callTimeline(Conwitter.URL.MENTIONS,last_id,null,callback);
  },

  getFriends: function(cursor) {
    if (cursor==-1) {
      Conwitter.Friends = new Array();
    }
    var params = {cursor:cursor};
    this.ajaxRequest(Conwitter.URL.FRIENDS,params,this.saveFriends.bind(this),"GET",true);
  },
  
  saveFriends: function(data) {
    for(var i=0;i<data.users.length;i++) {
      var f = {id:data.users[i].id,screen_name:data.users[i].screen_name};
      Conwitter.Friends.push(f);
    }
    if (data.next_cursor==0) {
      localStorage['friends'] = JSON.stringify(Conwitter.Friends);
    } else {
      this.getFriends(data.next_cursor);
    }
  },
  
  update: function(text,reply,callback) {
    var params = { status : text};
    if (reply!=null) {
      params.in_reply_to_status_id = reply;
    }
    this.ajaxRequest(Conwitter.URL.UPDATE,params,callback,"POST",true);
  },
  
  retweet: function(id,callback) {
    this.ajaxRequest(Conwitter.URL.RETWEET+id+".json",{},callback,"POST",true);
  }
  
});

