from django.urls import path
from .views import *

urlpatterns = [
    path('status', status, name='status'),
    path('signup', signup, name='signup'),
    path('logout', logoutUser, name='logout'),
    path('login', UserAPIView.as_view(), name='login'),
    path('booking', BookingAPIView.as_view(), name='booking'),
    path('schedule', FlightScheduleAPIView.as_view(), name='flightSchedule'),
    path('flight', FlightAPIView.as_view(), name='flight'),
]