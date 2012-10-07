module.exports = function(twitter, config) {
  twitter = new twitter({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.consumer_secret,
    access_token_key: config.twitter.access_token_key,
    access_token_secret: config.twitter.access_token_secret
  });

  twitter.verifyCredentials(function (err, data) {
    if (err) {
      console.log('Twitter credentials not valid!!');
    } else {
      console.log('Valid Twitter credentials!');
    }
  });

  return twitter;
};