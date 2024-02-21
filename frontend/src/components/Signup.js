import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bg from '../assets/bg-login.jpg';
import userService from '../services/UserService';
import Cookies from 'js-cookie';

const Signup = () => {

    const [creds, setCreds] = useState({first_name: '', last_name: '', email: '', username: '', password: '', re_password: ''});
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const SignUp = () => {
        if (Cookies.get('airAuthToken')) {
            Cookies.remove('airAuthToken');
        }
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (regex.test(creds.email) !== true) {
            setError("Invalid Email");
        } else if (creds.password !== creds.re_password) {
            setError("Passwords do not match");
        } else if (creds.password.length < 8) {
            setError("Password should be atleast 8 characters long");
        } else {
            userService.signup(creds)
            .then((response) => {    
                navigate({pathname: "/login"});
            })
            .catch((e) => {
                const regex = /Key \((\w+)\)=\((\w+)\) already exists/i;
                const match = e.response.data.match(regex);
                if (match && match.length >= 3) {
                    const field = match[1];
                    setError(`${field} already exists`);
                } else {
                    setError('Unknown Error');
                }
            })
        }
    }

    return (
        <div className='h-screen w-screen m-0 flex flex-col items-center justify-center' style={{backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundRepeat: "no-repeat"}}>
            <div className='h-3/4 w-3/12 flex flex-col items-center justify-between bg-slate-100/[.7] min-w-80 px-4 py-10 gap-5' style={{minHeight: "540px"}}>
                <h1 className='font-light text-4xl'>SignUp</h1>
                <div className='w-full flex flex-col gap-5 items-center'>
                    <div className='h-10 w-5/6 rounded-full flex justify-start items-center bg-white px-2 gap-3'>
                        <input className='w-full focus:outline-none font-semibold text-lg px-2' placeholder='First Name' type="text" value={creds.first_name} onChange={e => {setCreds({...creds, first_name: e.target.value})}}/>
                    </div>
                    <div className='h-10 w-5/6 rounded-full flex justify-start items-center bg-white px-2 gap-3'>
                        <input className='w-full focus:outline-none font-semibold text-lg px-2' placeholder='Last Name' type="text" value={creds.last_name} onChange={e => {setCreds({...creds, last_name: e.target.value})}}/>
                    </div>
                    <div className='h-10 w-5/6 rounded-full flex justify-start items-center bg-white px-2 gap-3'>
                        <input className='w-full focus:outline-none font-semibold text-lg px-2' placeholder='Email' type="email" value={creds.email} onChange={e => {setCreds({...creds, email: e.target.value})}}/>
                    </div>
                    <div className='h-10 w-5/6 rounded-full flex justify-start items-center bg-white px-2 gap-3'>
                        <input className='w-full focus:outline-none font-semibold text-lg px-2' placeholder='Username' type="text" value={creds.username} onChange={e => {setCreds({...creds, username: e.target.value})}}/>
                    </div>
                    <div className='h-10 w-5/6 rounded-full flex justify-start items-center bg-white px-2 gap-3'>
                        <input className='w-full focus:outline-none font-semibold text-lg px-2' placeholder='Password' type="password" value={creds.password} onChange={e => {setCreds({...creds, password: e.target.value})}}/>
                    </div>
                    <div className='h-10 w-5/6 rounded-full flex justify-start items-center bg-white px-2 gap-3'>
                        <input className='w-full focus:outline-none font-semibold text-lg px-2' placeholder='Re-Enter Password' type="password" value={creds.re_password} onChange={e => {setCreds({...creds, re_password: e.target.value})}}/>
                    </div>
                </div>
                <div className='flex w-full items-center justify-center gap-3 flex-col'>
                    <button className='h-10 px-6 py-2 bg-blue-600 font-bold rounded-full text-white text-center hover:h-12 hover:text-lg hover:shadow-lg hover:shadow-white' onClick={SignUp}>Sign Up</button>
                    {error && <p className='font-bold text-red-500'>{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default Signup;