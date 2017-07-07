# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import uuid
from django.db import models



class User(models.Model):
    objs = models.Manager()
    user_id = models.BigIntegerField()
    name = models.CharField(max_length=32)
    email = models.EmailField(null=True)
    location = models.CharField(null=True, max_length=32)
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
            user_id=self.user_id,
            latitude=self.latitude,
            longitude=self.longitude,
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
        return dict(sender=self.sender, message=self.message, created=self.created)











