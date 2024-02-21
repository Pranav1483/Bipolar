from rest_framework.serializers import ModelSerializer
from django.contrib.auth.models import User
from .models import *


class UserSerializer(ModelSerializer):

    class Meta:
        model = User
        fields = (
            'username',
            'first_name',
            'last_name',
            'email'
        )


class FlightSerializer(ModelSerializer):

    class Meta:
        model = Flight
        fields = '__all__'


class FlightScheduleSerializer(ModelSerializer):

    flight = FlightSerializer()
    class Meta:
        model = FlightSchedule
        fields = '__all__'


class BookingSerializer(ModelSerializer):

    user = UserSerializer()
    flightSchedule = FlightScheduleSerializer()
    class Meta:
        model = Booking
        fields = '__all__'