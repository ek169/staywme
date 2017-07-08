from django.conf.urls import url

from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    url(r'^', views.FrontendAppView.as_view(), name='index'),
    url('login/', views.login, name='login'),
    url('friends/', views.friends, name='friends'),
    url('profile/', views.profile, name='profile'),
    url('chat/', views.chat, name='chat'),
    url('allchats/', views.get_all_chats, name='all_chats'),
    url('viewed/', views.viewed, name='viewed'),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)