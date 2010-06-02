Conwitter.Frontend = function() {
  this.init();
}

$.extend(Conwitter.Frontend.prototype, {      
  init: function() {
    this.api = new Conwitter.API();
    this.timeline = chrome.extension.getBackgroundPage().Conwitter.Instances.Timeline;
    // calling render at document load makes the popup appearing slow
    setTimeout(this.render.bind(this), 100);
    this.reply_id = null;
  },

  backendLog: function(text) {
    this.timeline.log(text);
  },
  
  showReplies: function(elements,show_link) {
    if ($("#show_"+show_link).text()=="Show All Replies") {
      $("#show_"+show_link).html("Hide Old Replies");
    } else {
      $("#show_"+show_link).html("Show All Replies");
    }
    $(elements).each(function(i) {
      $(elements[i]).slideToggle("slow");
    });
  },
    
  render: function() {
    var _this = this;
    /*this.timeline.searchConversations('@vpj');*/
    var tweets = this.timeline.tweets;
    $("#tweets").html("");
    $(tweets).each(function(i) {
	     if(tweets[i].searchedShow == null || tweets[i].searchedShow == true) 
        $("#tweets").append(_this.renderTweet(tweets[i],false));
    });
        
    $('#tweets li div.back').hide();
    
    function mySideChange(front) {
        if (front) {
            $(this).parent().find('div.front').show();
            $(this).parent().find('div.back').hide();
        } else {
            $(this).parent().find('div.front').hide();
            $(this).parent().find('div.back').show();
        }
    }
    
    $('.tweet').hover(
          function () {
            $(this).find('div').stop().rotate3Di('flip', 250, {direction: 'clockwise', sideChange: mySideChange});
          }, 
          function() {
            $(this).find('div').stop().rotate3Di('unflip', 500, {sideChange: mySideChange});
          }
        );    
  },
  
  replyTo: function(tweet_id,username) {
    this.reply_id = tweet_id;
    $('#status').val('@'+username+" ");
    $('#status').focus();
  },
  
  retweet: function(tweet_id) {
    $('#retweet_'+tweet_id).attr('disabled',true);
    this.api.retweet(tweet_id,this.retweetCallback.bind(this));
  },
  
  retweetCallback: function(tweet) {
    $('#retweet_'+tweet.id).attr('disabled',false);
    this.timeline.addTweet(tweet);
    this.timeline.prepareTweets();
    this.render();
  },

  renderTweet: function(tweet,reply) {
    var str = "";
	  str += "<li id=\"tweet_"+tweet.id+"\" class=\""+Conwitter.Helper.getTweetClass(tweet,reply)+"\" style=\"background-color:"+Conwitter.Helper.getTweetColor(tweet)+";\">";
	  
    str += "<div class=\"tweet\">";
    str += "<div class=\"front\">";
    str += "<img width=\"48px\" height=\"48px\" src=\""+tweet.user.profile_image_url+"\"/>";
    str += "</div>";
    str += "<div class=\"back\">";
    str += '<input id="reply_'+tweet.id+'" type="button" value="Reply" />';
    str += '<input id="retweet_'+tweet.id+'" type="button" value="Retweet" />';
    str += "</div>";
    str += "<b>"+tweet.user.screen_name+"</b>";
    str += "<span class=\"time\"><a target=\"_blank\" href=\"http://twitter.com/"+tweet.user.screen_name+"/status/"+tweet.id+"\">"+$.timeago(tweet.created_at)+"</a></span><br/>";
    str += Conwitter.Helper.formatTweet(tweet.text)+"</div>";
    
    $("#reply_"+tweet.id).live("click",this.replyTo.bind(this,tweet.id,tweet.user.screen_name));
    $("#retweet_"+tweet.id).live("click",this.retweet.bind(this,tweet.id));
    
    if (tweet.replies) {
      var _this = this;
      var hidden = new Array();
      var tmp = "";
	    str += '<ul>';
      $(tweet.replies).each(function(i) {
        tmp += _this.renderTweet(tweet.replies[i],true);
        if (tweet.replies[i].id<=localStorage['last_id'] || tweet.replies[i].read) {
          hidden.push("#tweet_"+tweet.replies[i].id);
        }
      });
      if (hidden.length>0) {
        var show_id = Math.round((99977562 - 10016486) * Math.random() + 1) + 22423;
        str += "<li class=\"link\" id=\"show_"+show_id+"\">Show All Replies</li>";
        $("#show_"+show_id).live("click",this.showReplies.bind(this,hidden,show_id));
      }
      str += tmp;
	    str += '</ul>';
    }
    
    str += "</li>";
    
    return str;
  },
  
  create: function(text) {
    if ($('#update').attr('disabled')) return;
    $('#update').attr('disabled',true);
    this.api.update(text,this.reply_id,this.createCallback.bind(this));
  },
  
  updateCount: function(text) {
    var len = text.length;
    $('#wordcount').html((140 - len).toString());
  },
  
  textChanged: function(text) {
	  this.updateCount(text);
    // ac_results hidden part below makes sure that tweet is not created at autocomplete select
    if ($('#status').val()=="")
      this.reply_id = null;
  	else if (event.keyCode == 13 && !$(".ac_results").is("::visible"))
      this.create($('#status').val());
  },
  
  createCallback: function(tweet) {
    $('#update').attr('disabled',false);
    this.timeline.addTweet(tweet);
    this.timeline.prepareTweets();
    this.render();
    $('#status').val("");
  	$('#wordcount').html("");
  	this.reply_id = null;
  }
});
