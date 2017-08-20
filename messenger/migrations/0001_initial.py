# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-08-20 19:03
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import django.db.models.manager


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Chat',
            fields=[
                ('id', models.CharField(max_length=32, primary_key=True, serialize=False)),
                ('new_message', models.BooleanField(default=False)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
            managers=[
                ('objs', django.db.models.manager.Manager()),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comment', models.CharField(max_length=140)),
            ],
            managers=[
                ('objs', django.db.models.manager.Manager()),
            ],
        ),
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('chat_id', models.CharField(max_length=32)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('response', models.NullBooleanField()),
                ('creator_id', models.BigIntegerField()),
            ],
            managers=[
                ('objs', django.db.models.manager.Manager()),
            ],
        ),
        migrations.CreateModel(
            name='Friends',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            managers=[
                ('objs', django.db.models.manager.Manager()),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sender', models.BigIntegerField()),
                ('message', models.CharField(max_length=255)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('chat', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='messenger.Chat')),
            ],
            managers=[
                ('objs', django.db.models.manager.Manager()),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_id', models.BigIntegerField()),
                ('name', models.CharField(max_length=32)),
                ('email', models.EmailField(max_length=254, null=True)),
                ('location', models.CharField(max_length=32, null=True)),
                ('status', models.CharField(default='connecting', max_length=16)),
                ('top_activity', models.CharField(max_length=32, null=True)),
                ('bio', models.CharField(max_length=128, null=True)),
                ('picture_url', models.CharField(max_length=175, null=True)),
                ('latitude', models.DecimalField(decimal_places=8, max_digits=10)),
                ('longitude', models.DecimalField(decimal_places=8, max_digits=10)),
            ],
            managers=[
                ('objs', django.db.models.manager.Manager()),
            ],
        ),
        migrations.AddField(
            model_name='friends',
            name='user_owner',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='owner', to='messenger.User'),
        ),
        migrations.AddField(
            model_name='friends',
            name='users',
            field=models.ManyToManyField(blank=True, to='messenger.User'),
        ),
        migrations.AddField(
            model_name='event',
            name='user_one',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='participant1', to='messenger.User'),
        ),
        migrations.AddField(
            model_name='event',
            name='user_two',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='participant2', to='messenger.User'),
        ),
        migrations.AddField(
            model_name='comment',
            name='Event',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='event', to='messenger.Event'),
        ),
        migrations.AddField(
            model_name='comment',
            name='author',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='author', to='messenger.User'),
        ),
        migrations.AddField(
            model_name='chat',
            name='user_one',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user1', to='messenger.User'),
        ),
        migrations.AddField(
            model_name='chat',
            name='user_two',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user2', to='messenger.User'),
        ),
    ]
