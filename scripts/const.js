Conwitter = {
  Instances : {},
  URL: {
    HOME : "http://api.twitter.com/1/statuses/home_timeline.json",
    MENTIONS: "http://twitter.com/statuses/mentions.json",
    UPDATE: "http://twitter.com/statuses/update.json",
    RETWEET: "http://api.twitter.com/1/statuses/retweet/",
    REQUEST_TOKEN: "http://twitter.com/oauth/request_token",
    ACCESS_TOKEN: "http://twitter.com/oauth/access_token",
    AUTHORIZE: "http://twitter.com/oauth/authorize",
    STREAM: "http://stream.twitter.com/1/statuses/filter.json",
    FRIENDS: "http://twitter.com/statuses/friends.json"
  },
  OAuth: {
    consumerKey : "GMl6pbGifvAbXkPTwdBWCw",
    consumerSecret: "a9zYfdGGh9HZ19GmHOtMuXWDgPuwOfEA2KObwT8GLk",
    token : localStorage['oauth_token'],
    tokenSecret: localStorage['oauth_token_secret']
  },
  Options: {
    Interval : 3*60*1000,
    Count: 20,
    Scroll: 10,
    pageWidth: parseInt(localStorage['pageWidth']) || 380,
    pageHeight: parseInt(localStorage['pageHeight']) || 475,
    newColor: localStorage['newColor'] || 'ddffdd',
    mentionColor: localStorage['mentionColor'] || 'ffdddd',
    rtColor: localStorage['rtColor'] || 'c0c0f0',
    twitpic: localStorage['twitpic'] || 'thumb',
    Streaming: {
      enabled: (localStorage['stream']?localStorage['stream']=="true":false),
      username: localStorage['username'],
      password: localStorage['password']
    }
  },
  Messages: {
    LOADING: 1,
    REFRESH: 2,
    PIN: 3
  },
  Shortner: {
  },
  Friends: (localStorage['friends']?JSON.parse(localStorage['friends']):new Array())
};

