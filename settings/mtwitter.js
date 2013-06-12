module.exports = function(mtwitter, config) {
  mtwitter = new mtwitter({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.consumer_secret,
    access_token_key: config.twitter.access_token_key,
    access_token_secret: config.twitter.access_token_secret
  });

  mtwitter.get('account/verify_credentials', {screen_name: 'barcamperfurt'}, function(err, item) {
    if (err) {
      console.log('mTwitter credentials not valid!!');
      throw 'Credentials error || Abort program';
    } else {
      console.log('Valid mTwitter credentials!');
    }
  });

  return mtwitter;
};