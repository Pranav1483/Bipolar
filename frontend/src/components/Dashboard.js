import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import bg from '../assets/bg-login.jpg';
import userService from '../services/UserService';
import { Search, User } from 'lucide-react';

const Dashboard = () => {

    const currentDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        return formattedDateTime;
    }

    const [user, setUser] = useState(null);
    const [window, setWindow] = useState(false);
    const [bookings, setBookings] = useState(null);
    const [query, setQuery] = useState({start: currentDate(), end: currentDate(), origin: 'DEL', destination: 'BOM'});
    const [searchResults, setSearchResults] = useState([]);
    const authToken = Cookies.get("airAuthToken");
    const navigate = useNavigate();

    useEffect(() => {
        if (authToken) {
            userService.getUser(authToken)
            .then((response) => {
                setUser(response.data);
                userService.getUserBookings(authToken)
                .then((response) => {
                    setBookings(response.data.bookings);
                })
                .catch((e) => {

                });
            })
            .catch((e) => {
                Cookies.remove('airAuthToken');
                navigate({pathname: "/login"});
            });
        } else {
            navigate({pathname: "/login"})
        }   
    }, [authToken, navigate]);

    const toggleWindow = (name) => {
        if (name === false) {
            setWindow(false);
            setBookings(null);
            userService.getUserBookings(authToken)
            .then((response) => {
                setBookings(response.data.bookings);
            })
            .catch((e) => {

            });
        } else {
            setWindow(true);
        }
    }

    const searchFlight = () => {
        setSearchResults(null);
        userService.searchFlightsByQuery(authToken, query)
        .then((response) => {
            setSearchResults(response.data.flightSchedules);
        })
        .catch((e) => {

        });
    }

    const goToBooking = (id) => {
        navigate({pathname: "/booking", search: `?id=${id}`});
    }

    const Logout = () => {
        userService.logout(authToken)
        .then((response) => {
            Cookies.remove('airAuthToken');
            navigate({pathname: "/login"});
        })
        .catch((e) => {
            Cookies.remove('airAuthToken');
            navigate({pathname: "/login"});
        });
    }

    return (
        <div className='h-screen w-screen flex flex-col items-start justify-start' style={{backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundRepeat: "no-repeat"}}>
            <div className='h-16 w-full px-5 py-1 flex justify-between bg-slate-100/[.8] items-center'>
                <div className='h-full flex gap-5 items-center justify-center'>
                    <div className='h-3/4 aspect-square rounded-full text-center bg-slate-500 text-black font-bold flex items-center justify-center'>
                        <User size={28}/>
                    </div>
                    {user && <label className='text-black font-bold text-lg'>{user.username}</label>}
                    {!user && <div className='bg-slate-300 h-2/6 w-24 rounded-2xl animate-pulse'/>}
                </div>
                <button className='h-10 px-4 py-1 text-center font-semibold text-lg text-white bg-blue-500 rounded-full hover:bg-blue-400' disabled={(user === null)} onClick={Logout}>LOGOUT</button>
            </div>
            <div style={{height: "calc(100% - 80px)"}} className='w-full p-10'>
                <div className='h-full w-full bg-slate-100/[.8] rounded-3xl flex flex-col items-center justify-start p-2 gap-4'>
                    <div className='h-10 w-1/2 rounded-full flex'>
                        <button className={`h-full w-1/2 rounded-s-full border-r-2 border-r-white font-semibold text-lg ${(window === false)?"bg-blue-500 text-white":"bg-white text-black"}`} onClick={() => {toggleWindow(false)}}>My Bookings</button>
                        <button className={`h-full w-1/2 rounded-e-full border-l-2 border-l-white font-semibold text-lg ${(window === false)?"bg-white text-black":"bg-blue-500 text-white"}`} onClick={() => {toggleWindow(true)}}>Book Tickets</button>
                    </div>
                    {(window === false) && 
                    <div className='w-full rounded-3xl flex flex-col justify-start items-center gap-3' style={{height: "calc(100% - 10px)"}}>
                        <div className='h-9 w-full flex items-center justify-center'>
                            <div className='rounded-s-full bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Flight No.</div>
                            <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Origin</div>
                            <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Destination</div>
                            <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Departure</div>
                            <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Arrival</div>
                            <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Quantity</div>
                            <div className='rounded-e-full bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold'>Total Price</div>
                        </div>
                        {bookings && 
                        <div className='w-full flex flex-col overflow-scroll gap-4 mt-6' style={{height: "calc(100% - 60px)"}}>
                            {bookings.map((item, idx) => (
                                <div key={idx} className='h-9 w-full flex items-center justify-center'>
                                    <div className='rounded-s-full bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flightSchedule.flight.flight_number}</div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flightSchedule.flight.origin}</div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flightSchedule.flight.destination}</div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flightSchedule.departure.split("T")[0]} {item.flightSchedule.departure.split("T")[1].split("+")[0]}</div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flightSchedule.arrival.split("T")[0]} {item.flightSchedule.arrival.split("T")[1].split("+")[0]}</div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.quantity}</div>
                                    <div className='rounded-e-full bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold'>{item.quantity * item.flightSchedule.price}</div>
                                </div>
                            ))}
                        </div>}
                        {!bookings && 
                        <div className='w-full flex flex-col overflow-scroll gap-4 mt-6' style={{height: "calc(100% - 110px)"}}>
                            {[1, 2, 3, 4, 5, 6, 7].map((item, idx) => (
                                <div key={idx} className='h-9 w-full flex items-center justify-center' style={{minHeight: "36px"}}>
                                    <div className='rounded-s-full bg-white h-full w-2/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-24 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='rounded-e-full bg-white h-full w-2/12 flex items-center justify-center px-2 font-bold'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                </div>
                            ))}
                        </div>}
                    </div>
                    }
                    {(window === true) && 
                    <div className='w-full rounded-3xl flex flex-col justify-start items-center gap-3' style={{height: "calc(100% - 10px)"}}>
                        <div className='w-full rounded-full h-20 flex items-center justify-center'>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Departure</label>
                                <input className='rounded-full px-2 py-1' type="datetime-local" value={query.start} onChange={e => {setQuery({...query, start: e.target.value})}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Arrival</label>
                                <input className='rounded-full px-2 py-1' type="datetime-local" value={query.end} onChange={e => {setQuery({...query, end: e.target.value})}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Origin</label>
                                <input className='rounded-full px-2 py-1 text-center' type="text" value={query.origin} onChange={e => {if(e.target.value.length <= 3){setQuery({...query, origin: e.target.value.toUpperCase()})}}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Destination</label>
                                <input className='rounded-full px-2 py-1 text-center' type="text" value={query.destination} onChange={e => {if(e.target.value.length <= 3){setQuery({...query, destination: e.target.value.toUpperCase()})}}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-end pb-2'>
                                <button className='bg-blue-500 hover:bg-blue-400 rounded-full pl-3 pr-5 py-2 font-semibold text-white flex gap-2' disabled={(searchResults === null)} onClick={searchFlight}>
                                    <Search size={23} strokeWidth={2.6}/>
                                    <label className='hover:cursor-pointer'>Search</label>
                                </button>
                            </div>
                        </div>
                        <div className='h-9 w-full flex items-center justify-center'>
                            <div className='rounded-s-full bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Flight No.</div>
                            <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Origin</div>
                            <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Destination</div>
                            <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Departure</div>
                            <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Arrival</div>
                            <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Seats Left</div>
                            <div className='rounded-e-full bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold'>Price</div>
                        </div>
                        {searchResults &&
                            <div className='w-full flex flex-col overflow-scroll gap-4 mt-6' style={{height: "calc(100% - 60px)"}}>
                            {searchResults.map((item, idx) => (
                                <div key={idx} className='h-9 w-full flex items-center justify-center hover:cursor-pointer' onClick={() => {goToBooking(item.id)}}>
                                    <div className='rounded-s-full bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flight.flight_number}</div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flight.origin}</div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flight.destination}</div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.departure.split("T")[0]} {item.departure.split("T")[1].split("+")[0]}</div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.arrival.split("T")[0]} {item.arrival.split("T")[1].split("+")[0]}</div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.seats}</div>
                                    <div className='rounded-e-full bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold'>{item.price}</div>
                                </div>
                            ))}
                        </div>
                        }
                        {!searchResults && 
                            <div className='w-full flex flex-col overflow-scroll gap-4 mt-6' style={{height: "calc(100% - 200px)"}}>
                            {[1, 2, 3, 4, 5, 6, 7].map((item, idx) => (
                                <div key={idx} className='h-9 w-full flex items-center justify-center' style={{minHeight: "36px"}}>
                                    <div className='rounded-s-full bg-white h-full w-2/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-24 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='rounded-e-full bg-white h-full w-2/12 flex items-center justify-center px-2 font-bold'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                </div>
                            ))}
                        </div>}
                    </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default Dashboard;