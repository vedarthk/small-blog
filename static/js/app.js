var BlogPost = Backbone.Model.extend({
	defaults: function () {
		return {
			title : 'Null',
			body : 'Null'
		}
	}
});

var BlogPostCollection = Backbone.Collection.extend({
	model : BlogPost,
	url : '/api/v1/post/'
});

var BlogPosts = new BlogPostCollection();
console.log('BlogPostCollection initialized.')

var BlogPostView = Backbone.View.extend({
	tagName : "div",
	template : _.template($('#blog-post-template').html()),
	events : {
		'click .delete' : 'deletePost'
	},
	initialize : function () {
		this.listenTo(this.model, 'change', this.render)
	},
	render : function () {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

var BlogView = Backbone.View.extend({
	el : $('#blog'),
	initialize : function () {
		_.bindAll(this, 'render');
		BlogPosts.fetch({
			success : this.render
		});
	},
	render : function () {
		console.log('Rendering...')
		this.addAll();
	},
	addOne : function (blogPost) {
		console.log("Adding blog post.");
		var view = new BlogPostView({model : blogPost});
		this.$el.append(view.render().el);
	},
	addAll : function () {
		console.log(BlogPosts);
		BlogPosts.each(this.addOne, this);
	}
});

$(document).ready(function () {
	console.log('Loading Blog...');
	var Blog = new BlogView();
	console.log('Blog load finished.')
});
