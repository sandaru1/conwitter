Conwitter.Helper = {

  replaceText: function(regexp,replacement,text) {
    var regex = new RegExp(regexp,"ig");
    return text.replace(regex,replacement);
  },

  addLinks: function(text) {
    var regularExpression = "((file|gopher|news|nntp|telnet|http|ftp|https|ftps|sftp)://[a-zA-Z0-9\.\/\?\&_%-=~]+)";
    var replacement = "<a target=\"_blank\" href=\"$1\">$1</a>";
    return this.replaceText(regularExpression,replacement,text);
  },
  
  addUsernames: function(text) {
    var regularExpression = "@([a-zA-Z0-9_]+)";
    var replacement = "<a target=\"_blank\" href=\"http://twitter.com/$1\">@$1</a>";
    return this.replaceText(regularExpression,replacement,text);
  },

  addHashtags: function(text) {
    var regularExpression = "#([^ .,]+)";
    var replacement = "<a target=\"_blank\" href=\"http://twitter.com/search?q=%23$1\">#$1</a>";
    return this.replaceText(regularExpression,replacement,text);
  },
  
  addTwitpic: function(text,original) {
    if (Conwitter.Options.twitpic=="none") 
      return text;
    var regex = new RegExp("http://twitpic.com/([a-zA-Z0-9]+)","ig");
    var matches = original.match(regex);
    if (matches!=null) {
      for(var i=0;i<matches.length;i++) {
        var temp = regex.exec(matches[i]);
        if (temp!=null && temp.length>1) {
          var id = temp[1];
          text += '<p align="center"><a target="_blank" href="'+matches[i]+'"><img src="http://twitpic.com/show/'+Conwitter.Options.twitpic+'/'+id+'" alt="twitpic thumbnail" /></a></p>';
        }
      }
    }
    return text;
  },
  
  formatTweet: function(text) {
    var new_text = this.addLinks(text);
    new_text = this.addUsernames(new_text);
    new_text = this.addHashtags(new_text);
    new_text = this.addTwitpic(new_text,text);
    return new_text;
  },
    
  getTweetColor: function(tweet) {
    var col = 0xffffff;
    if(tweet.id > localStorage['last_id'] && !tweet.read)
  	  col &= parseInt("0x"+Conwitter.Options.newColor);
    if(tweet.text.search('@'+localStorage['screen_name']) != -1)
  	  col &= parseInt("0x"+Conwitter.Options.mentionColor);
    if(tweet.text.search('RT') == 0)
  	  col &= parseInt("0x"+Conwitter.Options.rtColor);
	  
  	return '#'+col.toString(16);
  },
  
  getTweetClass: function(tweet,reply) {
    if (tweet.id>localStorage['last_id'] && !tweet.read)
      return "unread";
    if (reply)
      return "readreply";
    return "read";
  }
}
