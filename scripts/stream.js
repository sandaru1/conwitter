Conwitter.Stream = {
  start: function(callback) {
    this.callback = callback;
    this.last = 0;
    this.queue = "";
    var ids = new Array();
    for(var i=0;i<Conwitter.Friends.length;i++) {
      ids.push(Conwitter.Friends[i].id);
    }
    this.follow = ids.join(",");
    
    if (this.follow=="") return;
    if (Conwitter.Options.Streaming.enabled==false) return;
    
    this.http=new XMLHttpRequest()
    this.http.open("POST", Conwitter.URL.STREAM, true,Conwitter.Options.Streaming.username,Conwitter.Options.Streaming.password); 
    this.http.onreadystatechange = function() { 
        if (Conwitter.Stream.http.readyState == 3) {
          Conwitter.Stream.extract();
        } else if (Conwitter.Stream.http.readyState == 4) {
          Conwitter.Stream.stop()
        } 
      }
    this.http.setRequestHeader('Content-Type',  "application/x-www-form-urlencoded; charset=UTF-8");
    this.http.send("follow="+this.follow);
    this.running = true;
  },
  
  stop: function() {
    this.http = null;
    this.running = false;
  },
  
  extract: function() {
    if (this.http==null) return;
    var temp = this.http.responseText;
    var newLine = false;
    // TODO: It's 2 AM in the morning, following code need to be rewritten using a nicer way!!
    for(var i=this.last;i<temp.length;i++) {
      if (temp.charAt(i)=="\r") {
        if (this.queue!="")
          this.callback(JSON.parse(this.queue));
        this.queue = "";
        newLine = true;
      } else {
        if (newLine) {
          if (temp.charAt(i)!="\n") {
            this.queue += temp.charAt(i);
          }
          newLine = false;
        } else {
          this.queue += temp.charAt(i);
        }
      }
    }
    this.last = temp.length;
  }
}
