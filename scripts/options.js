$(document).ready(function() {
  $('#pageWidth').val(Conwitter.Options.pageWidth);
  $('#pageHeight').val(Conwitter.Options.pageHeight);
  $('#mentionColor').val(Conwitter.Options.mentionColor);
  $('#rtColor').val(Conwitter.Options.rtColor);
  $('#newColor').val(Conwitter.Options.newColor);
  $('#twitpic').val(Conwitter.Options.twitpic);

  $('#homeTime').val(Conwitter.Options.Interval);
  $('#mentionsTime').val(Conwitter.Options.Interval);

  $('#stream').attr("checked",Conwitter.Options.Streaming.enabled);
  if (Conwitter.Options.Streaming.enabled==false){
    disableStreaming(true);
  }
  $('#username').val(Conwitter.Options.Streaming.username);
  $('#password').val(Conwitter.Options.Streaming.password);
  
  function disableStreaming(val) {
    $('#username').attr("disabled",val);
    $('#password').attr("disabled",val);
  }
  
  $('#stream').change(function() {
    disableStreaming(!$('#stream').attr('checked'));
  });

  $('#mentionColor, #rtColor, #newColor').ColorPicker({
  	onSubmit: function(hsb, hex, rgb, el) {
  		$(el).val(hex);
  		$(el).ColorPickerHide();
  	},
  	onBeforeShow: function () {
  		$(this).ColorPickerSetColor(this.value);
  	},
  	onChange: function(hsb, hex, rgb, el) {
  		$(el).val(hex);
  	}
  });
  
  $("#saveform").submit(function() {
    localStorage['pageWidth'] = $('#pageWidth').val();
    localStorage['pageHeight'] = $('#pageHeight').val();
    localStorage['mentionColor'] = $('#mentionColor').val();
    localStorage['rtColor'] = $('#rtColor').val();
    localStorage['newColor'] = $('#newColor').val();
    localStorage['twitpic'] = $('#twitpic').val();
    localStorage['stream'] = $('#stream').attr("checked");
    localStorage['username'] = $('#username').val();
    localStorage['password'] = $('#password').val();

    var background = chrome.extension.getBackgroundPage();
    
    background.Conwitter.Options.Streaming.enabled = (localStorage['stream']=="true");
    background.Conwitter.Options.Streaming.username = localStorage['username'];
    background.Conwitter.Options.Streaming.password = localStorage['password'];
  });
  
  $('li input').focus(function() {
    $(this).parent().parent().css('background-color','#ffffc1');
  });
  
  $('li input').blur(function() {
    $('ul').css('background-color','#fff');
  });
  
});

