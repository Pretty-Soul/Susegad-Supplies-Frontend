import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import BillingPage from './pages/BillingPage.jsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';
import './styles.css';

function Home(){ return (<div className='container'><h2>Welcome to Susegad Supplies</h2><p>Use the shop and admin to manage products.</p></div>); }

export default function App(){
  return (<AppProvider>
    <BrowserRouter>
      <header className='site-header'><Link to='/' className='logo'>Susegad</Link><Link to='/checkout' className='nav-link'>Checkout</Link></header>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/checkout' element={<BillingPage/>}/>
        <Route path='/order-confirmation' element={<OrderConfirmationPage/>}/>
      </Routes>
    </BrowserRouter>
  </AppProvider>);
}
