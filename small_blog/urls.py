from django.conf.urls import patterns, include, url
from tastypie.api import Api
from small_blog.api import PostResource, UserResource, CommentResource

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

v1_api = Api(api_name = 'v1')
v1_api.register(PostResource())
v1_api.register(UserResource())
v1_api.register(CommentResource())

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'small_blog.views.home', name='home'),
    url(r'^login[/]?$', 'small_blog.views.user_login', name='user_login'),
    url(r'^logout[/]?$', 'small_blog.views.user_logout', name='user_logout'),
    url(r'^post/new[/]?$', 'small_blog.views.post_new', name='user_logout'),
    # url(r'^small_blog/', include('small_blog.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    #(r'^blog/', include('small_blog.urls')),
    (r'^api/', include(v1_api.urls)),
)
