const Post = require("../models/post");


const homeStartingContent =
	'The home pages lists all the blogs from all the users.';

const composePost = (req, res) => {
	// put in cache after saving. This ensures we can cache by id.
	Post.save(req.user.username, req.body.postTitle, req.body.postBody).finally(() => {
		// putting this in a finally so that it happens after the submitted post is saved to the DB.
		res.redirect('/post')
	});
};

const displayAllPosts = (req, res) => {
	Post.findAll().then(posts => {
		res.render('home', {
			startingContent: homeStartingContent,
			posts: posts
		});
	});
}

async function displayPost(req, res) {
	const requestedPostId = req.params.postId;
	Post.findOne(requestedPostId).then(post => {
		res.render('post', post);
	});
}

module.exports = {
	displayAllPosts,
	displayPost,
	composePost
};
