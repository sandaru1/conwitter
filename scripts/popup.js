$(window).unload(function() {
  port.disconnect();
});

$(document).ready(function() {

  // didn't use "var" on "port" to make it global
  port = chrome.extension.connect({name: "popup"});
  port.onMessage.addListener(function(request) {
      switch (request.type) {
        case Conwitter.Messages.LOADING:
          $("#tweets").append("<li class=\"loading\"></li>");
          break;
        case Conwitter.Messages.REFRESH:
          Conwitter.Instances.Frontend.render();
          break;
      } 
  });

  
  Conwitter.Instances.Frontend = new Conwitter.Frontend();

  function insertText(text,space) {
    var cur_text = $('#status').val();
    if (space && cur_text.length>0 && cur_text.charAt(cur_text.length-1)!=" ") {
      cur_text += " ";
    }
    $('#status').val(cur_text+text+" ");
    $('#status').focus();
    Conwitter.Instances.Frontend.updateCount($('#status').val());
  }

  $('#shorten').click(function() {
    chrome.tabs.getSelected(null,function(tab){
          $('#link_text').val(tab.url);
      });
    $('.buttons').rotate3Di('flip', 250, {direction: 'clockwise', sideChange: function() {
        $('.shorten').show();
        $('.buttons').hide();
        $('#link_text').focus();
        $('#link_text').select();
      }
    });
  });
  
  function cancel() {
    $('#shortenInsert').attr("disabled", false);
    $('#link_text').val("");
    $('.buttons').show();
    $('.shorten').hide();
    $('.buttons').rotate3Di('unflip', 250, {});
  }
  
  $('#cancel').click(function() {
    cancel();
  });
  
  $('#shortenInsert').click(function() {
    $('#shortenInsert').attr("disabled", true);
    var link = $('#link_text').val();
    if (link=="") return;
    Conwitter.Shortner.Bitly.shorten(link,function(link) {
        insertText(link,true);
        cancel();
      });
  });
  
  $('#update').click(function() {
    Conwitter.Instances.Frontend.create($('#status').val());
  });

  $('#read').click(function() {
    Conwitter.Instances.Frontend.timeline.readTweets();
  });
  
  var showing_mentions = false;
  
/*  $('#mentions').click(function() {
    showing_mentions = !showing_mentions;
    if(showing_mentions)
      Conwitter.Instances.Frontend.timeline.searchConversations('@' + localStorage['username']);
    else
      Conwitter.Instances.Frontend.timeline.searchConversations('');
  });*/
  
  $('#tweets').scroll(function() {
    var diff = $('#tweets')[0].scrollHeight-$('#tweets').height()-$('#tweets').scrollTop();
    if (diff<=Conwitter.Options.Scroll) {
      Conwitter.Instances.Frontend.timeline.loadOldTweets();
    }
  });
  
  $('#status').keyup(function() {
    Conwitter.Instances.Frontend.textChanged($('#status').val());
  });
  
  if (navigator.platform.match(/linux/i)!=null) {
    $('#body').width(Conwitter.Options.pageWidth+2);
  } else {
    $('#body').width(Conwitter.Options.pageWidth);
  }
  
  $('div.main').width(Conwitter.Options.pageWidth);
  $('#tweets').width(Conwitter.Options.pageWidth);
  $('#tweets').height(Conwitter.Options.pageHeight);
  $('.top .middle').width(Conwitter.Options.pageWidth-18);
  
  var users = new Array();
  for(var i=0;i<Conwitter.Friends.length;i++) {
    users.push("@"+Conwitter.Friends[i].screen_name);
  }
  $("#status").autocomplete(users,{
                        multiple:true,
                        multipleSeparator: " "
                      });
});

if (navigator.platform.match(/linux/i)!=null) {
  document.write('<link rel="stylesheet" href="styles/frontend-linux.css" media="all" type="text/css" />')
}
