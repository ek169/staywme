from __future__ import unicode_literals
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from datetime import datetime
from datetime import date
from .utils import chatUtils, fb_api_calls, eventUtils
import json
from django.http import HttpResponse
from django.http import JsonResponse
from .models import User, Friends, Chat, Message, Event
from django.db.models import Q
import logging
from pygeocoder import Geocoder, GeocoderError
import time
from django.views.generic import View
import os

logging.basicConfig(filename='example.log', level=logging.DEBUG)


class FrontendAppView(View):

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        try:
            with open(os.path.join(settings.STATIC_ROOT, 'index.html')) as f:
                return HttpResponse(f.read())
        except IOError:
            return HttpResponse(404)


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
            elif data['valName'] == "status":
                user.status = data['val']
            elif data['valName'] == "topActivity":
                user.top_activity = data['val']
            elif data['valName'] == "bio":
                user.bio = data['val']
            else:
                return JsonResponse({'msg': 'improper input'})
            user.save()
            return JsonResponse({'msg': 'success'})
        return JsonResponse({'msg': 'no uid'})


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
            the_user_obj = User.objs.get(user_id=uid)
            return JsonResponse({'msg': the_user_obj.as_json()})


def friends(request):
    if request.method == 'GET':
        data = json.loads(request.GET.get('data'))
        uid = data['id']
        try:
            user_owner = User.objs.get(user_id=uid)
            user_owner_friends = Friends.objs.get(user_owner=user_owner)
            friend_id_list = list(user_owner_friends.users.values_list('user_id', flat=True).order_by('user_id'))
            return JsonResponse({'friends': friend_id_list})
        except ObjectDoesNotExist:
            return None

    if request.method == 'POST':
        data = json.loads(request.POST.get('data'))
        uid = data['id']
        try:
            user_owner = User.objs.get(user_id=uid)
            user_owner_friends = Friends.objs.get(user_owner=user_owner)
        except ObjectDoesNotExist:
            return JsonResponse({'msg': 'No user or friendlist exists'})
        if len(user_owner_friends.users.values_list('user_id', flat=True)) is 0:
            if len(data['friends']) is 0:
                return JsonResponse({'msg': 'false'})
        friends_list = []
        try:
            friends_list = data['friends']
        except KeyError:
            return JsonResponse({'msg': 'There were no friends in the data you sent'})

        query_friends_list = list(user_owner_friends.users.values_list('user_id', flat=True).order_by('user_id'))
        if friends_list == query_friends_list:
            return JsonResponse({'friends': user_owner_friends.as_json()})
        else:
            new_friends = list(set(friends_list).difference(query_friends_list))
            for friend_id in new_friends:
                friend_obj = User.objs.get(user_id=int(friend_id))
                user_owner_friends.add_friend(user_owner, friend_obj)

        return JsonResponse({'friends': user_owner_friends.as_json()})


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
                the_message = Message.objs.create(chat=chat_obj, sender=sender_id, message=message)
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


def get_mutual_friends(request):
    if request.method == 'POST':
        data = json.loads(request.POST.get('data'))
        user_id = data['user_id']
        access_token = data['access_token']
        if user_id and access_token:
            response = fb_api_calls.get_page_data(user_id, access_token)
            return JsonResponse({'msg': response})


def get_new_posts(request):
    if request.method == 'GET':
        data = json.loads(request.GET.get('data'))
        user_id = data['user_id']
        if user_id:
            the_user = User.objs.get(user_id=user_id)
            if the_user:
                friends_list = Friends.objs.get(user_owner=the_user)


def friends_events(request):
    if request.method == 'GET':
        data = json.loads(request.GET.get('data'))
        friend_id = data['friendId']
        friend = User.objs.get(user_id=friend_id)
        if friend:
            chat_list = Event.objs.filter(Q(user_one=friend) | Q(user_two=friend)).order_by('start_date')
            events = eventUtils.get_public_requests(chat_list, friend_id)
            return JsonResponse({'msg': events})
        return JsonResponse({'msg': "invalid request"})

    if request.method == "POST":
        return JsonResponse({"msg": "No such method"})

def edit_event(request):
    if request.method == 'POST':
        data = json.loads(request.POST.get('data'))
        event_id = data['eventId']
        try:
            response = data['response']
            uid = data['userId']
            logging.debug(uid)
            if (response is True or response is False) and event_id and uid:
                ev = Event.objs.get(id=event_id)
                ev.response = response
                ev.save()
                ev = eventUtils.event_as_json(ev, uid)
                return JsonResponse({'msg': ev})
        except KeyError:
            logging.debug("key error")
            pass
        start_date = data['startDate']
        end_date = data['endDate']
        if event_id and start_date and end_date:
            event = Event.objs.get(id=event_id)
            if event:
                start_date = datetime.strptime(start_date, "%Y-%m-%d")
                end_date = datetime.strptime(end_date, "%Y-%m-%d")
                event.start_date = start_date
                event.end_date = end_date
                event.response = None
                event.save()
                return JsonResponse({'msg': 'event updated'})
        return JsonResponse({'msg': 'invalid request'})


def event(request):
    if request.method == 'GET':
        data = json.loads(request.GET.get('data'))
        user_id = data['userId']
        user = User.objs.get(user_id=user_id)
        if user:
            chat_list = Event.objs.filter(Q(user_one=user) | Q(user_two=user)).order_by('start_date')
            event_types = eventUtils.get_all_requests(chat_list, user_id)
            return JsonResponse({'msg': event_types})
        return JsonResponse({'msg': "invalid request"})

    if request.method == 'POST':
        data = json.loads(request.POST.get('data'))
        chat_id = data['chatId']
        user_id = data['userId']
        other_user_id = data['otherUserId']
        start_date = data['startDate']
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = data['endDate']
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
        try:
            most_recent_event = Event.objs.filter(chat_id=chat_id).latest('start_date')
            if date.today() < most_recent_event.start_date:
                return JsonResponse({"msg": False})
        except ObjectDoesNotExist:
            pass
        user_one = User.objs.get(user_id=user_id)
        user_two = User.objs.get(user_id=other_user_id)
        if chat and start_date and end_date and user_one and user_two:
            event_as_obj = Event.objs.create(chat_id=chat_id, start_date=start_date, end_date=end_date,
                              user_one=user_one, creator_id=user_id, user_two=user_two)
            event_as_json = eventUtils.event_as_json(event_as_obj, user_id)
            return JsonResponse({"msg": event_as_json})
        return JsonResponse({"msg": False})


