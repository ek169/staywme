from django.conf.urls import url
from django.views.generic import TemplateView

from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    url('api/login/', views.login, name='login'),
    url('api/friends/', views.friends, name='friends'),
    url('api/profile/', views.profile, name='profile'),
    url('api/chat/', views.chat, name='chat'),
    url('api/allchats/', views.get_all_chats, name='all_chats'),
    url('api/viewed/', views.viewed, name='viewed'),
    url('api/get_mutual_friends', views.get_mutual_friends, name='mutual_friends'),
    url('api/event/', views.event, name="event"),
    url('api/edit_event', views.edit_event, name="edit_event"),
    # comment out these two below when in development
    url(r'^$', views.FrontendAppView.as_view(), name='index'),
    url(r'^(?:.*)/?$', views.FrontendAppView.as_view(), name='others'),
    ]





if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
