Conwitter.Timeline = function() {
  this.init();
}

$.extend(Conwitter.Timeline.prototype, {      
  init: function() {
    this.api = new Conwitter.API();
    this.tweets = new Array();
    this.tweet_ids = new Object();
    this.new_count = 0;
    this.last_id = localStorage['last_id'];
    if (this.last_id==null || this.last_id==0) {
      this.last_id = null;
      localStorage['last_id'] = 0;
    }
    this.max_id = this.last_id;
    this.first = true;

    Conwitter.Stream.start(this.streamTweet.bind(this));

    // get list of friends each time
    this.api.getFriends(-1);
    this.timerTick();

    this.port = null;

    var _this = this;

    chrome.extension.onConnect.addListener(function(port) {
      _this.port = port;
      _this.port.onDisconnect.addListener(function() {
          _this.port = null;
        });
    });
  },

  // use this for printing log messages in the background page console
  log: function(text) {
    console.log(text);
  }, 
  
  streamTweet: function(tweet) {
    //if (tweet.user==null) return;
    
    var is_friend = false;
    
    for(var i=0;i<Conwitter.Friends.length;i++) {
      if(tweet.user.id == Conwitter.Friends[i].id)
       is_friend = true;
    }
    
    if(tweet.text.search('RT') == 0 && is_friend == false)
      return;
    
    tweet.stream = true;
    if (tweet.in_reply_to_status_id==null || this.tweet_ids[tweet.in_reply_to_status_id]==null) {
      this.addTweet(tweet);
    } else {
      this.addReply(tweet);
    }
    this.prepareTweets();
  },
  
  searchFilter: function(searchString) {
    for(var i=0;i<this.tweets.length;i++) {
      this.tweets[i].searchedShow = false;

      if (this.tweets[i].text.search(searchString) != -1)
        this.tweets[i].searchedShow = true;
	     else if (this.tweets[i].replies) {
        for(var k=0;k<this.tweets[i].replies.length;k++) {
          if (this.tweets[i].replies[k].text.search(searchString) != -1) { 
            this.tweets[i].searchedShow = true;
			         break;
		        }
        }
      }
    }
  },
  
  readTweets: function() {
    this.last_id = this.max_id;
    localStorage['last_id'] = this.last_id;
    this.new_count = 0;
    
    // go through all stream tweets and mark them as read
    for(var i=0;i<this.tweets.length;i++) {
      if (this.tweets[i].stream)
        this.tweets[i].read = true;
      if (this.tweets[i].replies) {
        for(var k=0;k<this.tweets[i].replies.length;k++) {
          if (this.tweets[i].replies[k].stream)
            this.tweets[i].replies[k].read = true;
        }
      }
    }
    chrome.browserAction.setBadgeText({text:""});
    this.sendMessage(Conwitter.Messages.REFRESH);
  },

  sendMessage: function(msg) {
    if (this.port==null) return;
    this.port.postMessage({type: msg});
  },
  
  searchConversations: function(searchString) {
    this.searchFilter(searchString);
    this.sendMessage(Conwitter.Messages.REFRESH);
  },

  timerTick: function() {
    setTimeout(this.timerTick.bind(this), Conwitter.Options.Interval);
    this.api.homeTweets(this.max_id,this.updateTweets.bind(this,false));
    this.api.mentionsTweets(this.max_id,this.updateTweets.bind(this,false));

    if (Conwitter.Options.Streaming.enabled==true && Conwitter.Stream.running==false) {
      // Connection broke down
      // Streaming was enabled later
      // List of users was not ready
      Conwitter.Stream.start(this.streamTweet.bind(this));
    }
  },
  
  addTweet: function(tweet) {
    if (this.tweet_ids[tweet.id]!=null) {
      // if the tweet is already added, it's from the Streaming API
      // the second time is from the normal API
      // change the tweet status as the normal API because we need the max_id/last_id
      this.tweets[this.tweet_ids[tweet.id]].stream = false;
      if (this.tweets[this.tweet_ids[tweet.id]].read) {
        this.last_id = tweet.id;
        localStorage['last_id'] = this.last_id;
      }
      return;
    }
    tweet.time = Date.parse(tweet.created_at);
    this.tweet_ids[tweet.id] = this.tweets.length;
    this.tweets.push(tweet);
    if ((this.last_id==null || tweet.id>this.last_id) && !(tweet.read))
      this.new_count++;
  },
  
  addReply: function(tweet) {
    tweet.time = Date.parse(tweet.created_at);
    var parent_id = tweet.in_reply_to_status_id;
    var parent_pos = this.tweet_ids[parent_id];
    
    if (this.tweet_ids[tweet.id]==parent_pos) {
      for(var k=0;k<this.tweets[parent_pos].replies.length;k++) {
        if (this.tweets[parent_pos].replies[k].id==tweet.id) {
          this.tweets[parent_pos].replies[k].stream = false;
          if (this.tweets[parent_pos].replies[k].read) {
            this.last_id = tweet.id;
            localStorage['last_id'] = this.last_id;
          }
          break;
        }
      }
      return;
    }
    if (this.tweet_ids[tweet.id]!=null) {
      tweet.stream = false;
    }
    
    if (this.tweets[parent_pos].replies==null) {
      this.tweets[parent_pos].replies = new Array();
    }
    // remove nested replies
    var replies = tweet.replies;
    tweet.replies = null;

    this.tweets[parent_pos].replies.push(tweet);
    this.tweets[parent_pos].time = Math.max(this.tweets[parent_pos].time,tweet.time);
    if (this.tweet_ids[tweet.id]!=null) {
      // if the tweet was already added, mark it to be removed
      this.tweets[this.tweet_ids[tweet.id]].remove = true;
    } else {
      if ((this.last_id==null || tweet.id>this.last_id) && !(tweet.read))
        this.new_count++;
    }
    this.tweet_ids[tweet.id] = parent_pos;
    
    // add old replies to parent tweet
    if (replies!=null) {
      for(var i=0;i<replies.length;i++) {
        this.addReply(replies[i]);
      }
    }

  },
  
  updateTweets: function(load_replies,tweets) {  
    var _this = this;
    $(tweets).each(function(i) {
      if (tweets[i].in_reply_to_status_id==null) {
        _this.addTweet(tweets[i]);
      }
    });
    for(var i=tweets.length-1;i>=0;i--) {
      if (tweets[i].in_reply_to_status_id!=null) {
        if (this.tweet_ids[tweets[i].in_reply_to_status_id]==null) {
          this.addTweet(tweets[i]);
        } else {
          this.addReply(tweets[i]);
        }
      }
    }
    this.prepareTweets();
    if (load_replies) {
      // this is called if the old tweets were loaded, this takes the id of the last tweet shown
      // and get the mentions based on that - otherwise, it might load very old mentions
      this.api.mentionsTweets(tweets[tweets.length-1].id,this.updateTweets.bind(this,false));
    }
  },
  
  prepareTweets: function() {
    var _this = this;
    var new_tweets = new Array();
    
    // if the mentions were loaded first
    // we need to go through the tweets again and check whether parent is there
    $(this.tweets).each(function(i) {
      if (_this.tweets[i].in_reply_to_status_id!=null) {
        if (_this.tweet_ids[_this.tweets[i].in_reply_to_status_id]!=null) {
          _this.addReply(_this.tweets[i]);
        }
      }
    });

    // remove marked tweets - those are added as replies in a later stage    
    $(this.tweets).each(function(i) {
      if (_this.tweets[i].remove==null) {
        new_tweets.push(_this.tweets[i]);
      }
    });
    this.tweets = new_tweets;
    
    // sort the main timeline in decending order
    this.tweets.sort(function(a,b) { return b.time-a.time; });
    
    // recreate tweet_id, including replies
    this.tweet_ids = new Object();
    $(this.tweets).each(function(i) {
      _this.tweet_ids[_this.tweets[i].id] = i;
      // this is for use as the last_id
      if (!_this.tweets[i].stream)
        _this.max_id = Math.max(_this.max_id,parseInt(_this.tweets[i].id));
      if (_this.tweets[i].replies!=null) {
        // sort the replies in ascending order
        _this.tweets[i].replies.sort(function(a,b) { return a.time-b.time; });
        
        $(_this.tweets[i].replies).each(function(k) {
          _this.tweet_ids[_this.tweets[i].replies[k].id] = i;
          if (!_this.tweets[i].replies[k].stream)
            _this.max_id = Math.max(_this.max_id,parseInt(_this.tweets[i].replies[k].id));
        });
      }
    });
    
    if (this.new_count>0)
      chrome.browserAction.setBadgeText({text:String(this.new_count)});
      
    if (this.first && this.tweets.length<10) {
      // if the number of tweets are too low at the first run, get old tweets
      this.first = false;
      this.api.homeTweets(null,this.updateTweets.bind(this,true));
    }
    
    this.sendMessage(Conwitter.Messages.REFRESH);
  },
  
  loadOldTweets: function() {
    if (this.api.loading>0) return;
    this.sendMessage(Conwitter.Messages.LOADING);
    this.api.oldHomeTweets(this.tweets[this.tweets.length-1].id,this.updateTweets.bind(this,true));
  }
});

