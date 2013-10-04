from django.contrib.auth.models import User
from tastypie import fields
from tastypie.constants import ALL
from tastypie.authorization import DjangoAuthorization
from tastypie.throttle import BaseThrottle
from tastypie.resources import ModelResource, ALL_WITH_RELATIONS
from django.template.defaultfilters import slugify
from tastypie.serializers import Serializer

from small_blog.models import Post, Comment

class UserResource(ModelResource):
    comment = fields.ToManyField('small_blog.api.CommentResource', 'comment', null = True, blank = True, full = True)
    post = fields.ToManyField('small_blog.api.PostResource', 'post', null = True, blank = True, full = True)
    class Meta:
        queryset = User.objects.all()
        resource_name = 'user'
        fields = ['username', 'first_name', 'last_name']
        allowed_methods = ['get']

class PostResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user')
    comment = fields.ToManyField('small_blog.api.CommentResource', 'comment', null = True, blank = True, full = True)
    class Meta:
        always_return_data = True
        allowed_methods = ['get', 'post', 'delete', 'put']
        queryset = Post.objects.all()
        resource_name = 'post'
        authorization = DjangoAuthorization()
        fields = ['title', 'body']
        filtering = {
            "comment":ALL,
            "slug" : ('exact', 'startswith',),
            
            "title" : ALL,
        }
    
    def dehydrate_title(self, bundle):
        return bundle.data['title'].title()
    
    def dehydrate_body(self, bundle):
        return bundle.data['body'].replace('\n', '<br>')

    def dehydrate(self, bundle):
        #bundle.data['request_ip'] = bundle.request.META.get('REMOTE_ADDR')
        #bundle.data['date'] = bundle.data['pub_date'].strftime("%x")

        if bundle.request.user.is_authenticated() and bundle.request.user.id == bundle.obj.user.id:
            bundle.data['delete'] = True
        else:
            bundle.data['delete'] =  False
        return bundle

    def hydrate_user(self, bundle):
        bundle.data['user'] = bundle.request.user
        return bundle

    def hydrate_body(self, bundle):
        bundle.data['body'] = bundle.data['post']
        return bundle

    def alter_list_data_to_serialize(self, request, data):
        return data['objects']


class CommentResource(ModelResource):
    user = fields.ToOneField(UserResource, 'user')
    post = fields.ToOneField(PostResource, 'post')

    class Meta:
        ordering = ['pub_date']
        queryset = Comment.objects.all()
        resource_name = 'comment'
        authorization = DjangoAuthorization()
        filtering = {
            'post' : ALL_WITH_RELATIONS
        }

    def hydrate_user(self, bundle):
        bundle.data['user'] = bundle.request.user
        return bundle

    def hydrate_post(sefl, bundle):
        bundle.data['post'] = Post.objects.get(id = int(bundle.data['post']))
        return bundle

    def dehydrate(self, bundle):
        if bundle.request.user.is_authenticated() and bundle.request.user.id == bundle.obj.user.id:
            bundle.data['delete'] = True
        else:
            bundle.data['delete'] =  False
        return bundle
