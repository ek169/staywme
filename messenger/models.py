# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.db import models


class User(models.Model):
    objs = models.Manager()
    user_id = models.BigIntegerField()
    name = models.CharField(max_length=32)
    email = models.EmailField(null=True)
    location = models.CharField(null=True, max_length=32)
    status = models.CharField(max_length=16, default="connecting")
    top_activity = models.CharField(null=True, max_length=32)
    bio = models.CharField(null=True, max_length=128)
    picture_url = models.CharField(null=True, max_length=175)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=10, decimal_places=8)

    def __str__(self):
        return self.name

    def as_json(self):
        user_info = dict(
            name=self.name,
            email=self.email,
            location=self.location,
            picture=self.picture_url,
            status=self.status,
            top_activity=self.top_activity,
            bio=self.bio,
            user_id=self.user_id,
            latitude=self.latitude,
            longitude=self.longitude,
        )
        return user_info

    def simple_json(self):
        user_info = dict(
            name=self.name,
            user_id=self.user_id,
            picture=self.picture_url,
        )
        return user_info


class Friends(models.Model):
    objs = models.Manager()
    user_owner = models.ForeignKey(User, related_name='owner', null=True)
    users = models.ManyToManyField(User, blank=True)

    @classmethod
    def add_friend(cls, user_owner, new_friend):
        friends, created = cls.objs.get_or_create(
            user_owner=user_owner
        )
        friends.users.add(new_friend)

    def as_json(self):
        list_of_friends = []
        for f in self.users.all():
            list_of_friends.append(dict(
                user_id=f.user_id,
                name=f.name,
                email=f.email,
                location=f.location,
                picture_url=f.picture_url,
                status=f.status,
                top_activity=f.top_activity,
                bio=f.bio,
                latitude=f.latitude,
                longitude=f.longitude,
            ))
        return list_of_friends

    def __str__(self):
        return str(self.user_owner.user_id)


class Chat(models.Model):
    objs = models.Manager()
    id = models.CharField(primary_key=True, max_length=32)
    user_one = models.ForeignKey(User, related_name='user1')
    user_two = models.ForeignKey(User, related_name='user2')
    new_message = models.BooleanField(default=False)
    updated = models.DateTimeField(auto_now=True)


class Message(models.Model):
    objs = models.Manager()
    chat = models.ForeignKey(Chat, related_name='messages')
    sender = models.BigIntegerField()
    message = models.CharField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)

    def as_json(self):
        return dict(sender=self.sender, message=self.message,
                    created=self.created)


class Event(models.Model):
    objs = models.Manager()
    chat_id = models.CharField(max_length=32)
    start_date = models.DateField(null=False)
    end_date = models.DateField(null=False)
    user_one = models.ForeignKey(User, related_name='participant1')
    user_two = models.ForeignKey(User, related_name='participant2')
    response = models.NullBooleanField(null=True)
    creator_id = models.BigIntegerField()


    def as_json(self):
        return dict(chat_id=self.chat_id, start_date=self.start_date, end_date=self.end_date,
                    user_one=self.user_one, user_two=self.user_two)

class Comment(models.Model):
    objs = models.Manager()
    Event = models.ForeignKey(Event, related_name="event")
    author = models.ForeignKey(User, related_name="author")
    comment = models.CharField(max_length=140)











