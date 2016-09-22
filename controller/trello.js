var http = require("https");

function Trello(key, token) {
  this.key = key;
  this.token = token;
};

Trello.prototype.get = function(path, callback) {
    var options = {
      "method": "GET",
      "hostname": "api.trello.com"
    };

	if(path.indexOf("?") === -1) {
		options.path = path + "?";
	} else {
		options.path = path + "&"
	}
	options.path += "key=" + this.key + "&token=" + this.token;

	var req = http.request(options, function(res) {
	if (res.statusCode == 404 || res.statusCode == 403) {
	    console.log(res.statusCode + ": Trello api failed: " + path);
	    req.abort();
	} else {
	    var chunks = [];

	    res.on("data", function(chunk) {
	        chunks.push(chunk);
	    });

	    res.on("end", function() {
	        var body = Buffer.concat(chunks);
	        var data = JSON.parse(body);
	        callback(null, data);
	    });
	}
	});

	req.on("error", function(e) {
	console.log(e);
	callback(e);
	});

	req.on("timeout", function() {
	console.log("Trello api timed out.");
	req.abort();
	});

	req.setTimeout(30000);
	req.end();
};

module.exports = Trello;