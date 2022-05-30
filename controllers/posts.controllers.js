const Post = require("../models/post");
require('dotenv').config();
const config = require('../config/config');

const Redis = require('ioredis');
const redis = new Redis("redis://" + config.get("redis_host") + ":" + config.get("redis_port"));
// redis.connect().catch(console.error);
// redis.on("error", console.error)


const homeStartingContent =
	'The home pages lists all the blogs from all the users.';

const composePost = (req, res) => {
	// put in cache after saving. This ensures we can cache by id.
	Post.save(req.user.username, req.body.postTitle, req.body.postBody).then(post => {
		// post objects when reported bback do not include usernames, so strip that off.
		let postObj = {
			title: post.title,
			content: post.content
		};
		redis.setex(post.postid, 300, JSON.stringify(post),
		(err, reply) => {
		 if (err) {
		  console.log(err);
		 }
		 console.log(reply);
		}
	   );
	}).finally(() => {
		await redis.del("__allposts__");
		// putting this in a finally so that it happens after the submitted post is saved to the DB.
		res.redirect('/post')
	});
};

const displayAllPosts = (req, res) => {
	if (res.locals.cacheResult !== null) {
		// found in cache
		console.log('cache hit')
		res.render('home', {
			startingContent: homeStartingContent,
			posts: res.locals.cacheResult
		})
	} else {
		Post.findAll().then(posts => {
			if (posts.length > 0) {
				redis.setex("__allposts__", 300, JSON.stringify(posts));
			}
			console.log("cache miss")
			res.render('home', {
				startingContent: homeStartingContent,
				posts: posts
			});
		});
	}
};
async function displayPost (req, res)  {
	const requestedPostId = req.params.postId;
	if (res.locals.cacheResult !== null) {
		// found in cache
		console.log('cache hit')
		let postObj = {
			title: res.locals.cacheResult.title,
			content: res.locals.cacheResult.content
		}
		res.render('post', postObj);
	} else {
		console.log('cache miss')
		Post.findOne(requestedPostId).then(post =>  {
			// put in cache
			let postObj = {
				title: post.title,
				content: post.content
			}
			redis.setex(requestedPostId, 300, JSON.stringify(postObj));
			res.render('post', postObj);
		});
	}
};

module.exports = {
	displayAllPosts,
	displayPost,
    composePost
};
