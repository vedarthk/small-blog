from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response, redirect
from django.template import RequestContext
from django.contrib.auth import authenticate, login, logout

def home(request):
    response_dict = {}
    response_dict['user_authentication_failed'] = request.GET.get('user_authentication_failed', None)
    if request.user.is_authenticated():
        response_dict['user'] = request.user
    else:
        response_dict['user'] = None
    print request.user
    return render_to_response('index.html', response_dict, context_instance = RequestContext(request))

def user_login(request):
    username = request.POST.get('username', None)
    password = request.POST.get('password', None)

    user = authenticate(username = username, password = password)
    if user is not None:
        if user.is_active:
            login(request, user)
            return redirect('home')
        else:
            return redirect('home')
            print user, " is not active."
    else:
        return redirect('/?user_authentication_failed=1')
        print "User not in database."

def user_logout(request):
    logout(request)
    return redirect('home')


def post_new(request):
    return HttpResponse()