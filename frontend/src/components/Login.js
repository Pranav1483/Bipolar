import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import bg from '../assets/bg-login.jpg';
import { Lock, User } from 'lucide-react';
import userService from '../services/UserService';

const Login = () => {

    const [creds, setCreds] = useState({username: '', password: ''});
    const [error, setError] = useState('');
    const authToken = Cookies.get('airAuthToken');
    const navigate = useNavigate();

    useEffect(() => {
        if (authToken) {
            navigate({pathname: "/"});
        }
    }, [authToken, navigate]);

    const Login = () => {
        userService.login(creds)
        .then((response) => {
            Cookies.set('airAuthToken', response.data.token);
            navigate({pathname: "/"});
        })
        .catch((e) => {
            setError(e.response.data);
        })
    }

    return (
        <div className='h-screen w-screen m-0 flex flex-col items-center justify-center' style={{backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundRepeat: "no-repeat"}}>
            <div className='h-3/4 w-3/12 flex flex-col items-center justify-between bg-slate-100/[.7] min-h-96 min-w-80 px-4 py-10 gap-5'>
                <h1 className='font-light text-4xl'>Login</h1>
                <div className='w-full flex flex-col gap-5 items-center'>
                    <div className='h-10 w-5/6 rounded-full flex justify-start items-center bg-white px-2 gap-3'>
                        <User size={28} strokeWidth={2.7}/>
                        <input className='w-full focus:outline-none font-semibold text-lg' placeholder='Username' type="text" value={creds.username} onChange={e => {setCreds({...creds, username: e.target.value})}}/>
                    </div>
                    <div className='h-10 w-5/6 rounded-full flex justify-start items-center bg-white px-2 gap-3'>
                        <Lock size={27} strokeWidth={2.7}/>
                        <input className='w-full focus:outline-none font-semibold text-lg' placeholder='********' type="password" value={creds.password} onChange={e => {setCreds({...creds, password: e.target.value})}}/>
                    </div>
                </div>
                <div className='flex w-full items-center justify-center gap-3 flex-col'>
                    <button className='h-10 px-6 py-2 bg-blue-600 font-bold rounded-full text-white text-center hover:h-12 hover:text-lg hover:shadow-lg hover:shadow-white' onClick={Login}>LOGIN</button>
                    {error && <p className='font-bold text-red-500'>{error}</p>}
                </div>
                <div className='flex w-full items-center justify-center gap-1'>
                    <p className='text-lg'>Not a Member Yet ?</p>
                    <a href='/signup' className='underline text-lg font-semibold'>Join Now</a>
                </div>
            </div>
        </div>
    );
}

export default Login;