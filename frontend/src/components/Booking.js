import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import bg from '../assets/bg-login.jpg';
import userService from '../services/UserService';
import { User } from 'lucide-react';

const Booking = () => {

    const [user, setUser] = useState(null);
    const [flight, setFlight] = useState(null);
    const [quantity, setQuantity] = useState(0);
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');
    const [disabled, setDisabled] = useState(false);
    const navigate = useNavigate();
    const authToken = Cookies.get('airAuthToken');

    useEffect(() => {
        if (authToken) {
            userService.getUser(authToken)
            .then((response) => {
                setUser(response.data);
                userService.searchFlightsById(authToken, searchParams.get('id'))
                .then((response) => {
                    setFlight(response.data);
                })
                .catch((e) => {
                    navigate({pathname: "/"});
                })
            })
            .catch((e) => {
                Cookies.remove('airAuthToken');
                navigate({pathname: "/login"});
            });
        }
    }, [authToken, navigate, searchParams]);

    const buyTickets = () => {
        setDisabled(true);
        userService.buyTicket(authToken, searchParams.get('id'), quantity)
        .then((response) => {
            navigate({pathname: "/"});
        })
        .catch((e) => {
            if (e.status === 409) {
                setError("Not Enough Tickets Available");
            } else {
                setError("Server Error, Try Again");
            }
            setDisabled(false);
        });
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
            <div style={{height: "calc(100% - 80px)"}} className='w-full p-10 flex items-center justify-center'>
                <div className='h-full w-5/6 bg-slate-100/[.8] rounded-3xl flex items-center justify-start px-20 gap-5'>
                    <div className='h-full w-1/2 flex flex-col items-start justify-center gap-2'>
                        <h1 className='font-bold text-2xl'>Flight Details</h1>
                        <div className='bg-white rounded-3xl px-5 py-3 flex gap-1 items-center justify-center'>
                            <label className='font-semibold text-lg'>Flight No. :</label>
                            {(flight === null)?<div className='bg-slate-300 h-3/6 w-28 rounded-2xl animate-pulse'/>:<label className='font-thin text-lg'>{flight.flight.flight_number}</label>}
                        </div>
                        <div className='bg-white rounded-3xl px-5 py-3 flex gap-1 items-center justify-center'>
                            <label className='font-semibold text-lg'>Origin :</label>
                            {(flight === null)?<div className='bg-slate-300 h-3/6 w-28 rounded-2xl animate-pulse'/>:<label className='font-thin text-lg'>{flight.flight.origin}</label>}
                        </div>
                        <div className='bg-white rounded-3xl px-5 py-3 flex gap-1 items-center justify-center'>
                            <label className='font-semibold text-lg'>Destination :</label>
                            {(flight === null)?<div className='bg-slate-300 h-3/6 w-28 rounded-2xl animate-pulse'/>:<label className='font-thin text-lg'>{flight.flight.destination}</label>}
                        </div>
                        <div className='bg-white rounded-3xl px-5 py-3 flex gap-1 items-center justify-center'>
                            <label className='font-semibold text-lg'>Departure :</label>
                            {(flight === null)?<div className='bg-slate-300 h-3/6 w-28 rounded-2xl animate-pulse'/>:<label className='font-thin text-lg'>{flight.departure.split("T")[0]} {flight.departure.split("T")[1].split("+")[0]}</label>}
                        </div>
                        <div className='bg-white rounded-3xl px-5 py-3 flex gap-1 items-center justify-center'>
                            <label className='font-semibold text-lg'>Arrival :</label>
                            {(flight === null)?<div className='bg-slate-300 h-3/6 w-28 rounded-2xl animate-pulse'/>:<label className='font-thin text-lg'>{flight.arrival.split("T")[0]} {flight.arrival.split("T")[1].split("+")[0]}</label>}
                        </div>
                        <div className='bg-white rounded-3xl px-5 py-3 flex gap-1 items-center justify-center'>
                            <label className='font-semibold text-lg'>Seats Left :</label>
                            {(flight === null)?<div className='bg-slate-300 h-3/6 w-28 rounded-2xl animate-pulse'/>:<label className='font-thin text-lg'>{flight.seats}</label>}
                        </div>
                        <div className='bg-white rounded-3xl px-5 py-3 flex gap-1 items-center justify-center'>
                            <label className='font-semibold text-lg'>Price :</label>
                            {(flight === null)?<div className='bg-slate-300 h-3/6 w-28 rounded-2xl animate-pulse'/>:<label className='font-thin text-lg'>{flight.price}</label>}
                        </div>
                    </div>
                    <div className='h-full w-1/2 flex flex-col items-center justify-center gap-10'>
                        <div className='flex flex-col items-center justify-center gap-4'>
                            <label className='text-2xl'>Required Quantity</label>
                            <div className='flex gap-2 items-center justify-center bg-blue-500 rounded-full'>
                                <button className='p-3 rounded-full aspect-auto text-2xl text-white' onClick={() => {setQuantity(prevQuantity => Math.max(prevQuantity - 1, 0))}}>-</button>
                                <label className='text-2xl text-white'>{quantity}</label>
                                <button className='p-3 rounded-full aspect-auto text-2xl text-white' onClick={() => {setQuantity(prevQuantity => Math.min(prevQuantity + 1, flight.seats))}}>+</button>
                            </div>
                        </div>
                        <div className='flex flex-col items-center justify-center gap-4'>
                            <label className='text-2xl'>Total Price</label>
                            <div className='p-3 rounded-full bg-slate-700 h-14 flex items-center justify-center'>
                                {(flight === null)?<div className='bg-slate-300 h-6 w-28 rounded-2xl animate-pulse'/>:<label className='font-semibold text-2xl text-white'>&#8360; {String(flight.price * quantity).padStart(6, '0')}</label>}
                            </div>
                        </div>
                        <button className='px-4 py-2 bg-green-500 rounded-full hover:bg-green-400 text-lg font-semibold' onClick={buyTickets} disabled={disabled}>Buy Tickets</button>
                        {error && <p className='font-bold text-red-500 text-xl'>&#9888; {error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Booking