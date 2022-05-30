require('dotenv').config();
const config = require('../config/config');

const Redis = require('ioredis');
const redis = new Redis("redis://" + config.get("redis_host") + ":" + config.get("redis_port"));
// redis.connect().catch(console.error);
// redis.on('error',console.error)


const getCacheMiddleware = async (req, res, next) => {
    let id = req.params.postId;
    // when no postId, this was a request for all posts.
    // this magic ID needs to match the one in post controller displayAllPosts().
    if (id === undefined) {
        id = "__allposts__"
    }
    try {
      result = await redis.get(id);
      if (result !== undefined) {
        res.locals.cacheResult = JSON.parse(result)
      }
      return next();
    } catch(error) {
      console.log(error)
      return error;
    }
};

module.exports = {
	getCacheMiddleware,
};
