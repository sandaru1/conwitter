Conwitter.Shortner.Bitly = {
  shorten: function(link,callback) {
    $.getJSON("http://api.bit.ly/shorten?version=2.0.1&login=conwitter&apiKey=R_cfb5cc823420d0c5326eb82b57141b37&longUrl="+escape(link)+"&callback=?",
      function(data) {
        callback(Conwitter.Shortner.Bitly.getLink(data,link));
      }
    );
  },
  
  getLink: function(data,link) {
    var res = link;
    $.each(data.results,function(key,obj) {
      res = obj.shortUrl;
    });
    return res;
  }
}

