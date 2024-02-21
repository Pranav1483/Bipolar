from rest_framework.decorators import APIView, api_view
from rest_framework.status import *
from rest_framework.request import Request
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import *
from .permissions import *
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from pytz import timezone
import time


zone = timezone(settings.TIME_ZONE)

@api_view(['GET'])
def status(request: Request):
    return HttpResponse(status=HTTP_200_OK)

@api_view(['POST'])
def signup(request: Request):
    data = request.data
    user = User(username=data['username'], first_name=data['first_name'], last_name=data['last_name'], email=data['email'])
    user.set_password(data['password'])
    try:
        user.save()
        return HttpResponse(status=HTTP_204_NO_CONTENT)
    except Exception as e:
        return HttpResponse(str(e), status=HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def logoutUser(request: Request):
    token = request.auth
    if token and not request.user.is_staff:
        token.delete()
    return HttpResponse(status=HTTP_204_NO_CONTENT)

@api_view(['GET'])
def logoutAdmin(request: Request):
    token = request.auth
    if token and request.user.is_staff:
        token.delete()
    return HttpResponse(status=HTTP_204_NO_CONTENT)

class AdminAPIView(APIView):

    authentication_classes = [TokenAuthentication]

    def get(self, request: Request):
        if request.user.is_authenticated and request.user.is_staff:
            user = UserSerializer(request.user).data
            return JsonResponse(user, status=HTTP_200_OK)
        else:
            return HttpResponse(status=HTTP_401_UNAUTHORIZED)
        
    def post(self, request: Request):
        creds = request.data
        user = authenticate(request=request, username=creds['username'], password=creds['password'])
        if user is not None and user.is_staff:
            token_data = Token.objects.get_or_create(user=user)
            return JsonResponse({'token': token_data[0].key}, status=HTTP_200_OK)
        else:
            return HttpResponse(status=HTTP_401_UNAUTHORIZED)

class UserAPIView(APIView):

    authentication_classes = [TokenAuthentication]

    def get(self, request: Request):
        if request.user.is_authenticated:
            user = UserSerializer(request.user).data
            return JsonResponse(user, status=HTTP_200_OK)
        else:
            return HttpResponse(status=HTTP_401_UNAUTHORIZED)

    def post(self, request: Request):
        creds = request.data
        user = authenticate(request=request, username=creds['username'], password=creds['password'])
        if user is not None:
            token_data = Token.objects.get_or_create(user=user)
            return JsonResponse({'token': token_data[0].key}, status=HTTP_200_OK)
        else:
            return HttpResponse(status=HTTP_401_UNAUTHORIZED)


class BookingAPIView(APIView):

    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request: Request):
        if not request.user.is_staff:
            booking_id = request.query_params.get('booking')
            user = request.user
            if not booking_id:
                booking_objects = Booking.objects.filter(user=user)
                bookings = BookingSerializer(booking_objects, many=True).data
                return JsonResponse({'bookings': bookings}, status=HTTP_200_OK)
            else:
                booking_objects = Booking.objects.filter(user=user, id=booking_id)
                if not booking_objects.exists():
                    return HttpResponse(status=HTTP_404_NOT_FOUND)
                else:
                    return JsonResponse(BookingSerializer(booking_objects.first()).data, status=HTTP_200_OK)
        else:
            flight_number = request.query_params.get('flight_number')
            startDateTime = zone.localize(datetime.strptime(request.query_params.get('start'), "%Y-%m-%dT%H:%M")) if request.query_params.get('start') else False
            endDateTime = zone.localize(datetime.strptime(request.query_params.get('end'), "%Y-%m-%dT%H:%M"))  if request.query_params.get('end') else False
            if not flight_number and not startDateTime and not endDateTime:
                bookings = BookingSerializer(Booking.objects.all(), many=True).data
                return JsonResponse({'bookings': bookings}, status=HTTP_200_OK)
            elif flight_number:
                if not startDateTime or endDateTime:
                    if startDateTime:
                        booking_filters = Booking.objects.filter(flightSchedule__flight__flight_number=flight_number, flightSchedule__departure__gte=startDateTime)
                    elif endDateTime:
                        booking_filters = Booking.objects.filter(flightSchedule__flight__flight_number=flight_number, flightSchedule__departure__lte=endDateTime)
                    else:
                        booking_filters = Booking.objects.filter(flightSchedule__flight__flight_number=flight_number)
                else:
                    booking_filters = Booking.objects.filter(flightSchedule__flight__flight_number=flight_number, flightSchedule__departure__gte=startDateTime, flightSchedule__departure__lte=endDateTime)
            else:
                if startDateTime and endDateTime:
                    booking_filters = Booking.objects.filter(flightSchedule__departure__gte=startDateTime, flightSchedule__departure__lte=endDateTime)
                elif startDateTime:
                    booking_filters = Booking.objects.filter(flightSchedule__departure__gte=startDateTime)
                else:
                    booking_filters = Booking.objects.filter(flightSchedule__departure__lte=endDateTime)
            bookings = BookingSerializer(booking_filters, many=True).data
            return JsonResponse({'bookings': bookings}, status=HTTP_200_OK)
        
    def post(self, request: Request):
        if request.user.is_staff:
            return HttpResponse(status=HTTP_403_FORBIDDEN)
        else:
            data = request.data
            user = request.user
            flightSchedule_filter = FlightSchedule.objects.filter(id=data['flightScheduleId'])
            if not flightSchedule_filter.exists():
                return HttpResponse(status=HTTP_404_NOT_FOUND)
            else:
                flightSchedule = flightSchedule_filter.first()
                if flightSchedule.seats < data['quantity']:
                    return HttpResponse(status=HTTP_409_CONFLICT)
                else:
                    flightSchedule.seats -= data['quantity']
                    flightSchedule.save()
                    booking_filter = Booking.objects.filter(user=user, flightSchedule=flightSchedule)
                    if not booking_filter.exists():
                        booking = Booking(user=user, flightSchedule=flightSchedule, quantity=data['quantity'])
                    else:
                        booking = booking_filter.first()
                        booking.quantity += data['quantity']
                    try:
                        booking.save()
                        return HttpResponse(status=HTTP_204_NO_CONTENT)
                    except:
                        return HttpResponse(status=HTTP_400_BAD_REQUEST)
                

class FlightScheduleAPIView(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request: Request):
        if request.query_params.get('id'):
            flightSchedule_filters = FlightSchedule.objects.filter(id=request.query_params.get('id'))
            if not flightSchedule_filters.exists():
                return HttpResponse(status=HTTP_404_NOT_FOUND)
            else:
                flightSchedule = FlightScheduleSerializer(flightSchedule_filters.first()).data
                return JsonResponse(flightSchedule, status=HTTP_200_OK)
        else:
            if not request.user.is_staff:
                startDateTime = max(zone.localize(datetime.strptime(request.query_params.get('start'), "%Y-%m-%dT%H:%M")), datetime.now(zone))
                endDateTime = max(zone.localize(datetime.strptime(request.query_params.get('end'), "%Y-%m-%dT%H:%M")), datetime.now(zone))
            else:
                startDateTime = zone.localize(datetime.strptime(request.query_params.get('start'), "%Y-%m-%dT%H:%M"))
                endDateTime = zone.localize(datetime.strptime(request.query_params.get('end'), "%Y-%m-%dT%H:%M"))
            origin = request.query_params.get('origin')
            destination = request.query_params.get('destination')
            if not origin or not destination:
                if origin:
                    flightSchedule_filters = FlightSchedule.objects.filter(departure__gte=startDateTime, departure__lte=endDateTime, flight__origin=origin)
                elif destination:
                    flightSchedule_filters = FlightSchedule.objects.filter(departure__gte=startDateTime, departure__lte=endDateTime, flight__destination=destination)
                else:
                    flightSchedule_filters = FlightSchedule.objects.filter(departure__gte=startDateTime, departure__lte=endDateTime)
            else:
                flightSchedule_filters = FlightSchedule.objects.filter(departure__gte=startDateTime, departure__lte=endDateTime, flight__origin=origin, flight__destination=destination)
            flightSchedules = FlightScheduleSerializer(flightSchedule_filters, many=True).data
            return JsonResponse({'flightSchedules': flightSchedules}, status=HTTP_200_OK)
    
    def post(self, request: Request):
        if request.user.is_staff:
            data = request.data
            flight_filter = Flight.objects.filter(flight_number=data['flight_number'])
            if not flight_filter.exists():
                return HttpResponse(status=HTTP_404_NOT_FOUND)
            else:
                flight = flight_filter.first()
                flightSchedule = FlightSchedule(flight=flight, 
                                                departure=zone.localize(datetime.strptime(data['start'], "%Y-%m-%dT%H:%M")),
                                                arrival = zone.localize(datetime.strptime(data['end'], "%Y-%m-%dT%H:%M")),
                                                price = data['price']
                                                )
                try:
                    flightSchedule.save()
                    return HttpResponse(status=HTTP_204_NO_CONTENT)
                except Exception as e:
                    return HttpResponse(str(e), status=HTTP_400_BAD_REQUEST)
        else:
            return HttpResponse(status=HTTP_401_UNAUTHORIZED)
        
    def delete(self, request: Request):
        if request.user.is_staff:
            flightScheduleId = request.query_params.get('flightScheduleId')
            if flightScheduleId:
                flightSchedule_filter = FlightSchedule.objects.filter(id=flightScheduleId)
                if not flightSchedule_filter.exists():
                    return HttpResponse(status=HTTP_404_NOT_FOUND)
                else:
                    flightSchedule = flightSchedule_filter.first()
                    try:
                        flightSchedule.delete()
                        return HttpResponse(status=HTTP_204_NO_CONTENT)
                    except Exception as e:
                        return HttpResponse(str(e), status=HTTP_400_BAD_REQUEST)
            else:
                return HttpResponse(status=HTTP_409_CONFLICT)
        else:
            return HttpResponse(status=HTTP_403_FORBIDDEN)
        

class FlightAPIView(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request: Request):
        flight_number = request.query_params.get('flight_number')
        origin = request.query_params.get('origin')
        destination = request.query_params.get('destination')
        if not flight_number and not origin and not destination:
            flights = FlightSerializer(Flight.objects.all(), many=True).data
            return JsonResponse({'data': flights}, status=HTTP_200_OK)
        elif flight_number and origin and destination:
            flight_filter = Flight.objects.filter(flight_number=flight_number, origin=origin, destination=destination)
        else:
            if flight_number:
                if origin:
                    flight_filter = Flight.objects.filter(flight_number=flight_number, origin=origin)
                elif destination:
                    flight_filter = Flight.objects.filter(flight_number=flight_number, destination=destination)
                else:
                    flight_filter = Flight.objects.filter(flight_number=flight_number)
            else:
                if origin and destination:
                    flight_filter = Flight.objects.filter(origin=origin, destination=destination)
                elif origin:
                    flight_filter = Flight.objects.filter(origin=origin)
                else:
                    flight_filter = Flight.objects.filter(destination=destination)
        if not flight_filter.exists():
            return HttpResponse(status=HTTP_404_NOT_FOUND)
        else:
            return JsonResponse({'data': FlightSerializer(flight_filter, many=True).data}, status=HTTP_200_OK)
    
    def post(self, request: Request):
        data = request.data
        origin, destination = data['origin'].upper(), data['destination'].upper()
        if len(origin) != 3 or not origin.isalpha() or len(destination) != 3 or not destination.isalpha():
            return HttpResponse("Incorrect Location", status=HTTP_400_BAD_REQUEST)
        else:
            flight, created = Flight.objects.get_or_create(flight_number=data['flight_number'], origin=origin, destination=destination)
            if not created:
                return HttpResponse(status=HTTP_409_CONFLICT)
            try:
                flight.save()
                return HttpResponse(status=HTTP_204_NO_CONTENT)
            except Exception as e:
                return HttpResponse(str(e), status=HTTP_400_BAD_REQUEST)
    
    def delete(self, request: Request):
        flight_number = request.query_params.get('flight_number')
        flight_filter = Flight.objects.filter(flight_number=flight_number)
        if not flight_filter.exists():
            return HttpResponse(status=HTTP_404_NOT_FOUND)
        else:
            flight = flight_filter.first()
            try:
                flight.delete()
                return HttpResponse(status=HTTP_204_NO_CONTENT)
            except Exception as e:
                return HttpResponse(str(e), status=HTTP_400_BAD_REQUEST)
