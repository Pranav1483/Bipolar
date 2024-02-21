import React from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Booking from './components/Booking';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/booking' element={<Booking/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
