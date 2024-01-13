import Login from './components/Login/CenterLogin';
import SignUp from './components/SignUp/SignUp';
import './App.css';
import Homepage from './components/HomePage/HomePage';
import NavBar from './components/NavBar/NavBar';
import Profile from './components/Profile/NewProfile';
import Products from './components/Listings/Products';

import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { ToastContainer } from 'react-toastify';
import Product from './components/Product/Product';
import Favorites from './components/Favorite/Favorites';
import Carts from './components/Cart/Cart';
import Historys from './components/History/History';
import 'react-toastify/dist/ReactToastify.css';
import Orders from './components/Orders/Orders';
import TopRating from './components/TopRating/TopRating';


function App() {
  const cookies = new Cookies();
  const token = cookies.get('TOKEN');
  const userId = cookies.get('USERID');

  return (
    <>
    <NavBar style={{ marginBottom: '20px' }} />
      <Routes>
        <Route path="/" element={<Login />} exact />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/users/:userid" element={<Profile />} />
        <Route path="/products" element={<Products />} /> 
        <Route path="/products/:id" element={<Product />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/carts" element={<Carts />} />
        <Route path="/historys" element={<Historys />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/topRating" element={<TopRating />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
