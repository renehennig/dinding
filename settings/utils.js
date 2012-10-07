exports.capitalize = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.parseHasTags = function(string) {
  return string.replace(/[#]+[A-Za-z0-9\-_]+/gim, function(tag) {
    return '<a href="http://search.twitter.com/search?q=' + tag + '">' + tag + '</a>';
  });
};

exports.parseLinks = function(string) {
  var exp = /(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig;
  return string.replace(exp,"<a target='_blank' href='$1'>$1</a>");
};