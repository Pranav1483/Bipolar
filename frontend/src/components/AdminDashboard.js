import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import bg from '../assets/bg-login.jpg';
import userService from '../services/UserService';
import { PlusCircle, Search, Trash, User } from 'lucide-react';

const AdminDashboard = () => {

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
    const [window, setWindow] = useState(0);
    const [bookings, setBookings] = useState([]);
    const [query, setQuery] = useState({flight_number: '', origin: '', destination: ''});
    const [query1, setQuery1] = useState({start: currentDate(), end: currentDate(), origin: '', destination: ''});
    const [query2, setQuery2] = useState({start: '', end: '', flight_number: ''});
    const [searchResults, setSearchResults] = useState([]);
    const [searchResults1, setSearchResults1] = useState([]);
    const [newFlight, setNewFlight] = useState({flight_number: '', origin: '', destination: ''});
    const [newSchedule, setNewSchedule] = useState({flight_number: '', start: currentDate(), end: currentDate(), price: ''});
    const [newFlightStatus, setNewFlightStatus] = useState('');
    const [newScheduleStatus, setNewScheduleStatus] = useState('');
    const adminAuthToken = Cookies.get("airAdminAuthToken");
    const navigate = useNavigate();

    useEffect(() => {
        if (adminAuthToken) {
            userService.getAdmin(adminAuthToken)
            .then((response) => {
                setUser(response.data);
            })
            .catch((e) => {
                Cookies.remove('airAdminAuthToken');
                navigate({pathname: "/admin/login"});
            });
        } else {
            navigate({pathname: "/admin/login"})
        }   
    }, [adminAuthToken, navigate]);

    const toggleWindow = (num) => {
        if (num === window) {
            return;
        } else if (num === 0) {
            setWindow(0);
        } else if (num === 1) {
            setWindow(1);
        } else if (num === 2) {
            setWindow(2);
        }
    }

    const searchFlight = () => {
        setSearchResults(null);
        userService.adminSearchFlight(adminAuthToken, query)
        .then((response) => {
            setSearchResults(response.data.data);
            console.log(response.data.data);
        })
        .catch((e) => {
            setSearchResults([]);
        })
    }

    const deleteFlight = (idx) => {
        userService.adminDeleteFlight(adminAuthToken, searchResults[idx].flight_number)
        .then((response) => {
            setSearchResults(searchResults.filter(item => item.flight_number !== searchResults[idx].flight_number));
        })
        .catch((e) => {

        });
    }

    const addNewFlight = () => {
        userService.adminAddFlight(adminAuthToken, newFlight)
        .then((response) => {
            setNewFlightStatus("Success");
        })
        .catch((e) => {
            if (e.response.status === 409) {
                setNewFlightStatus('Duplicate Found');
            } else if (e.response.data === "Incorrect Location") {
                setNewFlightStatus(e.response.data);
            } else {
                setNewFlightStatus("Server Error");
            }
        })
    }

    const searchFlightSchedule = () => {
        setSearchResults1(null);
        userService.searchFlightsByQuery(adminAuthToken, query1)
        .then((response) => {
            setSearchResults1(response.data.flightSchedules);
        })
        .catch((e) => {
            setSearchResults1([]);
        });
    }

    const deleteSchedule = (idx) => {
        userService.adminDeleteSchedule(adminAuthToken, searchResults1[idx].id)
        .then((response) => {
            setSearchResults1(searchResults1.filter(item => item.id !== searchResults1[idx].id));
        })
        .catch((e) => {

        });
    }

    const addFlightSchedule = () => {
        userService.adminAddSchedule(adminAuthToken, newSchedule)
        .then((response) => {
            setNewScheduleStatus('Success');
        })
        .catch((e) => {
            if (e.response.data.includes('duplicate')) {
                setNewScheduleStatus("Duplicate Found");
            } else {
                setNewScheduleStatus("Server Error");
            }
        })
    }

    const searchBookings = () => {
        setBookings(null);
        userService.adminSearchBookings(adminAuthToken, query2)
        .then((response) => {
            setBookings(response.data.bookings);
        })
        .catch((e) => {
            setBookings([]);
        });
    }

    const Logout = () => {
        userService.logoutAdmin(adminAuthToken)
        .then((response) => {
            Cookies.remove('airAdminAuthToken');
            navigate({pathname: "/admin/login"});
        })
        .catch((e) => {
            Cookies.remove('airAdminAuthToken');
            navigate({pathname: "/admin/login"});
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
                        <button className={`h-full w-1/3 rounded-s-full border-r-2 border-r-white font-semibold text-lg ${(window === 0)?"bg-blue-500 text-white":"bg-white text-black"}`} onClick={() => {toggleWindow(0)}}>Flights</button>
                        <button className={`h-full w-1/3 border-l-2 border-l-white font-semibold text-lg ${(window === 1)?"bg-blue-500 text-white":"bg-white text-black"}`} onClick={() => {toggleWindow(1)}}>Flight Schedules</button>
                        <button className={`h-full w-1/3 rounded-e-full border-l-2 border-l-white font-semibold text-lg ${(window === 2)?"bg-blue-500 text-white":"bg-white text-black"}`} onClick={() => {toggleWindow(2)}}>Bookings</button>
                    </div>
                    {(window === 0) && 
                    <div className='w-full flex flex-col items-center justify-start' style={{height: "calc(100% - 60px)"}}>
                        <div className='w-full rounded-full h-20 flex items-center justify-center'>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Flight Number</label>
                                <input className='rounded-full px-2 py-1 text-center' type="number" value={query.flight_number} onChange={e => {setQuery({...query, flight_number: e.target.value.toUpperCase()})}}/>
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
                            <div className='rounded-s-full bg-white h-full w-3/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Flight No.</div>
                            <div className='bg-white h-full w-3/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Origin</div>
                            <div className='bg-white h-full w-3/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Destination</div>
                            <div className='rounded-e-full bg-white h-full w-3/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Action</div>
                        </div>
                        {searchResults &&
                            <div className='w-full flex flex-col overflow-scroll gap-4 mt-6' style={{height: "calc(100% - 200px)"}}>
                            {searchResults.map((item, idx) => (
                                <div key={idx} className='h-9 w-full flex items-center justify-center'>
                                    <div className='rounded-s-full bg-white h-full w-3/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flight_number}</div>
                                    <div className='bg-white h-full w-3/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.origin}</div>
                                    <div className='bg-white h-full w-3/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.destination}</div>
                                    <div className='rounded-e-full bg-white h-full w-3/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>
                                        <button className='bg-red-500 rounded-full px-3 py-1 text-white hover:bg-red-400' onClick={() => {deleteFlight(idx)}}><Trash/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        }
                        {!searchResults && 
                            <div className='w-full flex flex-col overflow-scroll gap-4 mt-6' style={{height: "calc(100% - 200px)"}}>
                            {[1, 2, 3, 4, 5, 6, 7].map((item, idx) => (
                                <div key={idx} className='h-9 w-full flex items-center justify-center' style={{minHeight: "36px"}}>
                                    <div className='rounded-s-full bg-white h-full w-4/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-24 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-4/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='rounded-e-full bg-white h-full w-4/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                </div>
                            ))}
                        </div>}
                        <div className='w-full rounded-full h-20 flex items-center justify-center'>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Flight Number</label>
                                <input className='rounded-full px-2 py-1 text-center' type="number" value={newFlight.flight_number} onChange={e => {setNewFlight({...newFlight, flight_number: e.target.value.toUpperCase()})}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Origin</label>
                                <input className='rounded-full px-2 py-1 text-center' type="text" value={newFlight.origin} onChange={e => {if(e.target.value.length <= 3){setNewFlight({...newFlight, origin: e.target.value.toUpperCase()})}}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Destination</label>
                                <input className='rounded-full px-2 py-1 text-center' type="text" value={newFlight.destination} onChange={e => {if(e.target.value.length <= 3){setNewFlight({...newFlight, destination: e.target.value.toUpperCase()})}}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-end pb-2'>
                                <button className='bg-green-500 hover:bg-green-400 rounded-full pl-3 pr-5 py-2 font-semibold text-white flex gap-2' onClick={addNewFlight}>
                                    <PlusCircle size={23} strokeWidth={2.6}/>
                                    <label className='hover:cursor-pointer'>Add</label>
                                </button>
                                <p className={`${(newFlightStatus === 'Success')?"text-green-500":"text-red-500"} font-bold`}>{newFlightStatus}</p>
                            </div>
                        </div>
                    </div>
                    }
                    {(window === 1) && 
                    <div className='w-full rounded-3xl flex flex-col justify-start items-center gap-3' style={{height: "calc(100% - 10px)"}}>
                        <div className='w-full rounded-full h-20 flex items-center justify-center'>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Departure</label>
                                <input className='rounded-full px-2 py-1' type="datetime-local" value={query1.start} onChange={e => {setQuery1({...query1, start: e.target.value})}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Arrival</label>
                                <input className='rounded-full px-2 py-1' type="datetime-local" value={query1.end} onChange={e => {setQuery1({...query1, end: e.target.value})}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Origin</label>
                                <input className='rounded-full px-2 py-1 text-center' type="text" value={query1.origin} onChange={e => {if(e.target.value.length <= 3){setQuery1({...query1, origin: e.target.value.toUpperCase()})}}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Destination</label>
                                <input className='rounded-full px-2 py-1 text-center' type="text" value={query1.destination} onChange={e => {if(e.target.value.length <= 3){setQuery1({...query1, destination: e.target.value.toUpperCase()})}}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-end pb-2'>
                                <button className='bg-blue-500 hover:bg-blue-400 rounded-full pl-3 pr-5 py-2 font-semibold text-white flex gap-2' disabled={(searchResults1 === null)} onClick={searchFlightSchedule}>
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
                            <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Price</div>
                            <div className='rounded-e-full bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold'>Action</div>
                        </div>
                        {searchResults1 &&
                            <div className='w-full flex flex-col overflow-scroll gap-4 mt-6' style={{height: "calc(100% - 250px)"}}>
                            {searchResults1.map((item, idx) => (
                                <div key={idx} className='h-9 w-full flex items-center justify-center'>
                                    <div className='rounded-s-full bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flight.flight_number}</div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flight.origin}</div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flight.destination}</div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.departure.split("T")[0]} {item.departure.split("T")[1].split("+")[0]}</div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.arrival.split("T")[0]} {item.arrival.split("T")[1].split("+")[0]}</div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.seats}</div>
                                    <div className='bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.price}</div>
                                    <div className='rounded-e-full bg-white h-full w-1/12 flex items-center justify-center p-2 font-bold'><button className='bg-red-500 hover:bg-red-400 text-white rounded-full px-3 py-1' onClick={() => {deleteSchedule(idx)}}><Trash/></button></div>
                                </div>
                            ))}
                        </div>
                        }
                        {!searchResults1 && 
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
                        <div className='w-full rounded-full h-20 flex items-center justify-center'>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Flight Number</label>
                                <input className='rounded-full px-2 py-1 text-center' type="number" value={newSchedule.flight_number} onChange={e => {setNewSchedule({...newSchedule, flight_number: e.target.value})}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Departure</label>
                                <input className='rounded-full px-2 py-1' type="datetime-local" value={newSchedule.start} onChange={e => {setNewSchedule({...newSchedule, start: e.target.value})}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Arrival</label>
                                <input className='rounded-full px-2 py-1' type="datetime-local" value={newSchedule.end} onChange={e => {setNewSchedule({...newSchedule, end: e.target.value})}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Price</label>
                                <input className='rounded-full px-2 py-1 text-center' type="number" value={newSchedule.price} onChange={e => {setNewSchedule({...newSchedule, price: e.target.value})}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-end pb-2'>
                                <button className='bg-green-500 hover:bg-green-400 rounded-full pl-3 pr-5 py-2 font-semibold text-white flex gap-2' onClick={addFlightSchedule}>
                                    <PlusCircle size={23} strokeWidth={2.6}/>
                                    <label className='hover:cursor-pointer'>Add</label>
                                </button>
                                <p className={`${(newScheduleStatus === 'Success')?"text-green-500":"text-red-500"} font-bold`}>{newScheduleStatus}</p>
                            </div>
                        </div>
                    </div>
                    }
                    {(window === 2) && 
                    <div className='w-full rounded-3xl flex flex-col justify-start items-center gap-3' style={{height: "calc(100% - 10px)"}}>
                        <div className='w-full rounded-full h-20 flex items-center justify-center'>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Flight Number</label>
                                <input className='rounded-full px-2 py-1 text-center' type="text" value={query2.flight_number} onChange={e => {setQuery2({...query2, flight_number: e.target.value})}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Departure</label>
                                <input className='rounded-full px-2 py-1' type="datetime-local" value={query2.start} onChange={e => {setQuery2({...query2, start: e.target.value})}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-center gap-1'>
                                <label className='font-semibold'>Arrival</label>
                                <input className='rounded-full px-2 py-1' type="datetime-local" value={query2.end} onChange={e => {setQuery2({...query2, end: e.target.value})}}/>
                            </div>
                            <div className='w-1/6 h-full flex flex-col items-center justify-end pb-2'>
                                <button className='bg-blue-500 hover:bg-blue-400 rounded-full pl-3 pr-5 py-2 font-semibold text-white flex gap-2' disabled={(bookings === null)} onClick={searchBookings}>
                                    <Search size={23} strokeWidth={2.6}/>
                                    <label className='hover:cursor-pointer'>Search</label>
                                </button>
                            </div>
                        </div>
                        <div className='h-9 w-full flex items-center justify-center'>
                        <div className='rounded-s-full bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>User</div>
                            <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Flight No.</div>
                            <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Departure</div>
                            <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Arrival</div>
                            <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>Quantity</div>
                            <div className='rounded-e-full bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold'>Total Price</div>
                        </div>
                        {bookings && 
                        <div className='w-full flex flex-col overflow-scroll gap-4 mt-6' style={{height: "calc(100% - 60px)"}}>
                            {bookings.map((item, idx) => (
                                <div key={idx} className='h-9 w-full flex items-center justify-center'>
                                    <div className='rounded-s-full bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.user.username}</div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flightSchedule.flight.flight_number}</div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flightSchedule.departure.split("T")[0]} {item.flightSchedule.departure.split("T")[1].split("+")[0]}</div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.flightSchedule.arrival.split("T")[0]} {item.flightSchedule.arrival.split("T")[1].split("+")[0]}</div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold border-r border-slate-400'>{item.quantity}</div>
                                    <div className='rounded-e-full bg-white h-full w-2/12 flex items-center justify-center p-2 font-bold'>{item.quantity * item.flightSchedule.price}</div>
                                </div>
                            ))}
                        </div>}
                        {!bookings && 
                        <div className='w-full flex flex-col overflow-scroll gap-4 mt-6' style={{height: "calc(100% - 110px)"}}>
                            {[1, 2, 3, 4, 5, 6, 7].map((item, idx) => (
                                <div key={idx} className='h-9 w-full flex items-center justify-center' style={{minHeight: "36px"}}>
                                    <div className='rounded-s-full bg-white h-full w-2/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-24 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
                                    <div className='bg-white h-full w-2/12 flex items-center justify-center px-2 font-bold border-r border-slate-400'><div className='bg-slate-300 h-2/6 w-28 rounded-2xl animate-pulse'/></div>
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

export default AdminDashboard;