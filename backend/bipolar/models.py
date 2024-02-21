from django.db import models
from django.contrib.auth.models import User


class Flight(models.Model):  
    flight_number = models.PositiveBigIntegerField(primary_key=True)
    origin = models.CharField(max_length=3)
    destination = models.CharField(max_length=3)


class FlightSchedule(models.Model):
    flight = models.ForeignKey(to=Flight, on_delete=models.CASCADE)
    departure = models.DateTimeField()
    arrival = models.DateTimeField()
    seats = models.PositiveSmallIntegerField(default=60)
    price = models.PositiveBigIntegerField()

    class Meta:
        unique_together = ('flight', 'departure', 'arrival')


class Booking(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    flightSchedule = models.ForeignKey(to=FlightSchedule, on_delete=models.CASCADE)
    quantity = models.PositiveSmallIntegerField()
    time = models.DateTimeField(auto_now_add=True)