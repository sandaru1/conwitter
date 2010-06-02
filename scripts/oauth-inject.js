var pin = parseInt($('#oauth_pin').text());
$('.message-content').html("<h2>Conwitter is talking with the twitter servers!</h2><p>Be patient, this won't take long.</p>");

chrome.extension.sendRequest({type: Conwitter.Messages.PIN, pin:pin},function(response) {
  $('.message-content').html("Done");
});
