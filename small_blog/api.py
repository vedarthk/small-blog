from django.contrib.auth.models import User
from tastypie import fields
from tastypie.constants import ALL
from tastypie.authorization import DjangoAuthorization
from tastypie.throttle import BaseThrottle
from tastypie.resources import ModelResource
from small_blog.models import Post

class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        resource_name = 'user'
        fields = ['username', 'first_name', 'last_name']
        allowed_methods = ['get']

class PostResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user')

    class Meta:
        queryset = Post.objects.all()
        resource_name = 'post'
        authorization = DjangoAuthorization()
        include_resource_uri = False
        filtering = {
            "slug" : ('exact', 'startswith',),
            "title" : ALL,
        }
        throttle = BaseThrottle(throttle_at = 0)
    
    def dehydrate_title(self, bundle):
        return bundle.data['title'].title()
    
    def dehydrate(self, bundle):
        bundle.data['request_ip'] = bundle.request.META.get('REMOTE_ADDR')
        bundle.data['date'] = bundle.data['pub_date'].strftime("%x")
        bundle.data['body'] = bundle.data['body'].replace('\n', '<br>')
        return bundle
