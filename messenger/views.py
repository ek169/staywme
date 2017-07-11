from __future__ import unicode_literals
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from .utils import chatUtils
import json
from django.http import HttpResponse
from django.http import JsonResponse
from .models import User, Friends, Chat, Message
from django.db.models import Q
import logging
from pygeocoder import Geocoder, GeocoderError
import time
from django.views.generic import View
import os


logging.basicConfig(filename='example.log', level=logging.DEBUG)

class FrontendAppView(View):
    """
    Serves the compiled frontend entry point (only works if you have run `yarn
    run build`).
    """

    @csrf_exempt
    def get(self, request):
        try:
            with open(os.path.join(settings.STATIC_ROOT, 'index.html')) as f:
                return HttpResponse(f.read())
        except IOError:
            return HttpResponse(404
            )

@csrf_exempt
def profile(request):
    if request.method == 'GET':
        time.sleep(1)
        data = json.loads(request.GET.get('data'))
        user = User.objs.get(user_id=data['id'])
        if user:
            return JsonResponse({'user': user.as_json()})
        return JsonResponse({'msg': 'could not update'})

    if request.method == 'POST':
        data = json.loads(request.POST.get('data'))
        if data['id']:
            user = User.objs.get(user_id=data['id'])
            if data['valName'] == "location":
                location = data['val']
                try:
                    formatted_location = Geocoder.geocode(location)
                    if formatted_location:
                        user.location = str(formatted_location)
                        coordinates = formatted_location.coordinates
                        latitude = float(coordinates[0])
                        longitude = float(coordinates[1])
                        user.latitude = latitude
                        user.longitude = longitude
                except GeocoderError:
                    user.location = location
            elif data['valName'] == "email":
                user.email = data['val']
            else:
                return JsonResponse({'msg': 'improper input'})
            user.save()
            return JsonResponse({'msg': 'success'})
        return JsonResponse({'msg': 'no uid'})


@csrf_exempt
def login(request):

    if request.method == 'POST':
        data = json.loads(request.POST.get('data'))
        uid = int(data['id'])
        try:
            user = User.objs.get(user_id=uid)
            if user:
                return JsonResponse({'msg': user.as_json()})
        except ObjectDoesNotExist:
            try:
                location = data['location']
                if Geocoder.geocode(location).valid_address:
                    location = Geocoder.geocode(location)
                    coordinates = location.coordinates
                    latitude = coordinates[0]
                    longitude = coordinates[1]
                else:
                    latitude = 0.0
                    longitude = 0.0

            except KeyError:
                location = ""
                latitude = 0.0
                longitude = 0.0
            try:
                email = data['email']
            except KeyError:
                email = ""
            try:
                picture_url = data['picture_url']
            except KeyError:
                picture_url= ""

            name = data['name']
            new_user = User.objs.create(user_id=uid, name=name, location=location,
                                        email=email, picture_url=picture_url, latitude=latitude,
                                        longitude=longitude)
            time.sleep(1)
            friends_list = Friends.objs.create(user_owner=new_user)
            return JsonResponse({'msg': new_user.as_json})

@csrf_exempt
def friends(request):
    if request.method == 'POST':
        data = json.loads(request.POST.get('data'))
        uid = data['id']
        try:
            user_owner = User.objs.get(user_id=uid)
            user_owner_friends = Friends.objs.get(user_owner=user_owner)
        except ObjectDoesNotExist:
            return None
        if len(user_owner_friends.users.values_list('user_id', flat=True)) is 0:
            if len(data['friends']) is 0:
                return JsonResponse({'msg': 'false'})
        friends_list = []
        try:
            friends_list = data['friends']
        except KeyError:
            return None
        for friend_id in friends_list:
            if friend_id not in user_owner_friends.users.values_list('user_id', flat=True):
                friend_obj = User.objs.get(user_id=int(friend_id))
                user_owner_friends.add_friend(user_owner, friend_obj)
                friend_obj_friends = Friends.objs.get(user_owner=friend_obj)
                for extended_connection_id in friend_obj_friends.users.values_list('user_id', flat=True):
                    if extended_connection_id is not user_owner.user_id and extended_connection_id not in user_owner_friends.users.values_list('user_id', flat=True):
                        extended_connection = User.objs.get(user_id=int(extended_connection_id))
                        user_owner_friends.add_friend(user_owner, extended_connection)

        return JsonResponse({'friends': user_owner_friends.as_json()})

@csrf_exempt
def get_all_chats(request):
    if request.method == 'GET':
        data = json.loads(request.GET.get('data'))
        uid = data['uid']
        if uid:
            user = User.objs.get(user_id=int(uid))
            if type(user) == User:
                chat_list = Chat.objs.filter(Q(user_one=user) | Q(user_two=user)).order_by('updated')
                json_of_chats = chatUtils.getChatMessageJson(user.user_id, chat_list)
                return JsonResponse({'chats': json_of_chats})

        return JsonResponse({'chats': 'none'})

@csrf_exempt
def chat(request):
    if request.method == 'GET':
        data = json.loads(request.GET.get('data'))
        current_uid = data['current_uid']
        friend_uid = data['friend_uid']
        if current_uid and friend_uid:
            if current_uid < friend_uid:
                chat_id = str(current_uid) + str(friend_uid)
            else:
                chat_id = str(friend_uid) + str(current_uid)
            the_chat = Chat.objs.get(id=str(chat_id))
            if type(chat) == Chat:
                messages = Message.objs.filter(chat=the_chat).order_by('created')
                messages_json = []
                for m in messages:
                    messages_json.append(m.as_json)

                return JsonResponse({'messages': messages_json})

            return JsonResponse({'msg': 'new chat'})

    if request.method == 'POST':
        data = json.loads(request.POST.get('data'))
        receiver_id = data['receiver_id']
        sender_id = data['sender_id']
        message = data['message']
        if message == " ":
            message = False
        if receiver_id and sender_id and message:
            if int(sender_id) < int(receiver_id):
                chat_id = str(sender_id) + str(receiver_id)
            else:
                chat_id = str(receiver_id) + str(sender_id)
            try:
                chat_obj = Chat.objs.get(id=str(chat_id))
                Message.objs.create(chat=chat_obj, sender=sender_id, message=message)
                chat_obj.new_message = True
                chat_obj.save()
            except ObjectDoesNotExist:
                user_one = User.objs.get(user_id=sender_id)
                user_two = User.objs.get(user_id=receiver_id)
                new_chat = Chat.objs.create(id=str(chat_id), user_one=user_one, user_two=user_two,
                                            new_message=True)
                Message.objs.create(chat=new_chat, sender=sender_id, message=message)
            return JsonResponse({'msg': 'success'})
        return JsonResponse({'msg': 'failure'})

@csrf_exempt
def viewed(request):
    if request.method == 'POST':
        data = json.loads(request.POST.get('data'))
        chat_id = data['chat_id']
        if chat_id:
            the_chat = Chat.objs.get(id=str(chat_id))
            the_chat.new_message = False
            the_chat.save()
            return JsonResponse({'msg': 'success'})
        return JsonResponse({'msg': 'failure'})








