  var API = {};
  //
  // Function to load API URIs
  //
  function loadApiUris() {
      baseAPI = '/api/v1/';
      $.ajax({
          'url': baseAPI,
              'type': 'get',
              'dataType': 'json',
              'async': false
      }).done(function (resObj) {
          for ( var apiName in resObj) {
              API[apiName] = resObj[apiName].list_endpoint;
          }
          console.log(API);
      });
  }

  //
  // Fucntion to delete blog post
  //
  function deleteBlogPost() {
      if (confirm("Should I delete this post ?")) {
          $.ajax({
              'url': $(this).attr('data-uri'),
                  'type': 'delete',
                  'dataType': 'json',
                  'success': function (resObj) {
                  $("body").append('<div class="alert alert-success fade in"><a class="close pull-right" data-dismiss="alert" href="#">&times;</a>Blog post deleted.</div>');
                  window.location.hash = "";
                  loadBlogs();
              }
          });
      } else {
          window.location.hash = "";
      }
  }

  //
  // Fucntion to delete blog post comment
  //
  function deleteBlogPostComment() {
      var post = $(this).attr('data-post-uri');
      if (confirm("Should I delete this comment ?")) {
          console.log("Deleting " + $(this).attr('data-uri'));
          $.ajax({
              'url': $(this).attr('data-uri'),
                  'type': 'delete'
          }).done(function (res) {
              console.log("Fetching comments for " + post);
              loadBlogs();
              loadComments(post);
          });
      } else {
          window.location.hash = "";
      }
  }

  //
  // Function to convert HTML form data to JSON object
  //
  function convertFormToJson(form) {
      var array = $(form).serializeArray();
      var json = {};
      $.each(array, function () {
          json[this.name] = this.value || '';
      });
      return json;
  }

  //
  // Function to get User object from the API URI
  //
  function getUserObj(api) {
      var userObj;
      $.ajax({
          'type': 'get',
              'url': api,
              'dataType': 'json',
              'async': false,
              'success': function (user) {
              userObj = user;
          }
      });
      return userObj;
  }

  //
  // Function to load comments for a post
  //
  function loadComments(post) {
      console.log("Fetching comments for " + post);
      $.ajax({
          'url': post,
              'dataType': 'json',
              'type': 'get'
      }).done(function (postObj) {
          if (postObj.comment.length > 0) {
              var comments = "<hr><h4>Comments</h4>";
              for (var i = 0; i < postObj.comment.length; i++) {
                  comments += '<div class="well">';
                  if (postObj.comment[i].delete) {
                      comments += '<a class="pull-right delete-comment" data-uri="' + postObj.comment[i].resource_uri + '" data-post-uri="' + postObj.resource_uri + '" href="#"><i class="glyphicon glyphicon-trash"></i></a>';
                  }
                  comments += '<small>by ' + getUserObj(postObj.comment[i].user).username + '</small><p>' + postObj.comment[i].comment + '</p>';
                  comments += '</div>';
              }
              $("#blog-post-single .modal-body .post-comments").html(comments);
              $('a.delete-comment').click(deleteBlogPostComment);
          }
      });
  }
  //
  // Function to load a single blog post
  //
  function loadBlogPost() {
      console.log(window.location);
      postId = parseInt($(this).attr('id'), 10);
      console.log("Fetiching post #" + postId.toString());
      $.ajax({
          'type': 'get',
              'url': API.post + postId.toString() + '/?format=json',
              'dataType': 'json',
              'success': function (postObj) {
              $("#blog-post-single .modal-header h3").html(postObj.title);
              $("#blog-post-single .modal-body .post-body").html(postObj.body);
              $("#blog-post-single .modal-body .post-comments").html("");
              var commentForm = $("form#comment-new");
              if (commentForm) {
                  commentForm.append('<input type="hidden" name="post" value="' + postObj.id + '">');
                  commentForm.append('<input type="hidden" name="post_resource_uri" value="' + postObj.resource_uri + '">');
              }
              loadComments(postObj.resource_uri);
              window.location.hash = "#!/post/" + postObj.slug;
              console.log(postObj.comment);
              $("#blog-post-single").modal();
              console.log("Fetiching post #" + postId.toString() + ' complete.');
          }
      });
  }

  //
  // Fucntion to load all the blog posts on the home page
  //
  function loadBlogs(baseAPI) {

      $("#canvas").html("Loading...");
      console.log('Fetching blog posts...');
      $.ajax({
          'type': 'get',
              'url': API.post,
              'dataType': 'json',
              'success': function (resObj) {
              $("#canvas").html("");
              for (var i = 0; i < resObj.meta.limit && i < resObj.meta.total_count; i++) {
                  var blogPost = '<div class="blog-post">';
                  blogPost += '<div class="title" id="' + resObj.objects[i].id + '">' + resObj.objects[i].title + '<span class="badge pull-right">' + resObj.objects[i].date + '</span></div>';
                  blogPost += '<div class="post">';
                  if (resObj.objects[i].delete) {
                      blogPost += '&nbsp;<a class="delete-post pull-right" data-uri="' + resObj.objects[i].resource_uri + '" href="#!' + resObj.objects[i].resource_uri + '"><i class="glyphicon glyphicon-trash"></i></a>';
                  }
                  if (resObj.objects[i].comment.length > 0) {
                      blogPost += '<span class="label label-warning pull-right">' + resObj.objects[i].comment.length + ' comment(s)</span>';
                  }
                  blogPost += '<span class="label label-info pull-right">by ' + getUserObj(resObj.objects[i].user).username + '</span></div>';
                  blogPost += '<div class="post">' + resObj.objects[i].body + '</div></div>';
                  $("#canvas").append(blogPost + '<hr>');
              }
              console.log('Fetching blog posts completed.');
              $('.blog-post .title').click(loadBlogPost);
              $('.blog-post .delete-post').click(deleteBlogPost);
              $('#blog-post-single').on('hidden', function () {
                  window.location.hash = "";
              });
          },
              'error': function (xhr, textStatus, errorThrown) {
              if (xhr.status > 400 && xhr.status < 500) {
                  $("#canvas").html('There is something wrong with the API. Ask <a href="#" onclick="loadBlogs(\'' + API.post + '\')">BOB</a> to fix it.');
                  console.log('Fetching blog posts returned error ' + xhr.status);
              } else if (xhr.status > 500 && xhr.status < 600) {
                  $("#canvas").html('Sorry, our servers are not working. Ask <a href="#">ROB</a> to fix it.');
              }
          }
      });
  }

  function createBlogPost(event) {
      event.preventDefault();
      var form = this;
      var json = convertFormToJson(form);
      console.log(JSON.stringify(json));
      $.ajax({
          'type': 'post',
              'contentType': 'application/json',
              'url': API.post,
              'data': JSON.stringify(json),
              'processData': false
      }).done(function () {
          $("body").append('<div class="alert alert-success fade in"><a class="close pull-right" data-dismiss="alert" href="#">&times;</a>New blog post created.</div>');
          loadBlogs();
          $("div#post-new").modal('toggle');
      });
  }

  function createComment(event) {
      event.preventDefault();
      var form = this;
      var json = convertFormToJson(form);
      console.log(json);
      $.ajax({
          'type': 'post',
              'contentType': 'application/json',
              'url': API.comment,
              'data': JSON.stringify(json),
              'processData': false
      }).done(function (res) {
          loadBlogs();
          loadComments(json.post_resource_uri);
          $("form#comment-new").each(function () {
              this.reset();
          });
      });
  }
