  module.exports = function(config) {
  exports.checkUser = function(data, method) {
    if (method === 'search') return search(data);

    return stream(data);
  };

  stream = function(data) {
    if (!data.username) return data;
    if (!data.userid) return data;

    for (var white in config.dinding.user_whitelist) {
      if (data.username === config.dinding.user_whitelist[white]) {
        data.tweetisok = true;
        return data;
      }
    }

    if (!data.tweetisok) {
      for (var black in config.dinding.user_blacklist) {
        if (data.username === config.dinding.user_blacklist[black]) {
          data.tweetisok = false;
          return data;
        }
      }
    }

    if (!data.followerscount) return data;
    if (Number(data.followerscount) < 10) return data;

    if (!data.friendscount) return data;
    if (Number(data.friendscount) < 10) return data;

    if (!data.created) return data;
    if (new Date().getTime() - new Date(data.created).getTime < 604800) return data;

    data.tweetisok = true;
    return data;
  };

  search = function(data) {
    for (var white in config.dinding.user_whitelist) {
      if (data.username === config.dinding.user_whitelist[white]) {
        console.log(data.username + ' is WHITELISTED!!');
        data.tweetisok = true;
        return data;
      }
    }

    if (!data.tweetisok) {
      for (var black in config.dinding.user_blacklist) {
        if (data.username === config.dinding.user_blacklist[black]) {
          console.log(data.username + ' is BLACKLISTED!!');
          data.tweetisok = false;
          return data;
        }
      }
    }

    data.tweetisok = true;
    return data;
  };
};