import React from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Booking from './components/Booking';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/booking' element={<Booking/>}/>
        <Route path='/admin/login' element={<AdminLogin/>}/>
        <Route path='/admin' element={<AdminDashboard/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
