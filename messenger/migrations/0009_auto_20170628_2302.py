# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-06-28 23:02
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messenger', '0008_auto_20170627_1438'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chat',
            name='id',
            field=models.CharField(max_length=64, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='chat',
            name='updated',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
