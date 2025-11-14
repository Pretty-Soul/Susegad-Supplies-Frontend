import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function OrderConfirmationPage(){
  const [order, setOrder] = useState(null);
  useEffect(()=>{
    const raw = localStorage.getItem('confirmedOrder');
    if(raw){
      try{
        setOrder(JSON.parse(raw));
        localStorage.removeItem('confirmedOrder');
      }catch(e){ setOrder(null); }
    }
  },[]);
  if(!order) return <div style={{padding:20}}>No order found.</div>;
  const address = order.order.address || order.address || {};
  return (<div className='container' style={{padding:20}}>
    <h2>Thank you! Order placed.</h2>
    <p>Order ID: {order.order._id || order.orderId || 'N/A'}</p>
    <div><h4>Delivering to</h4><p>{address.fullName} - {address.city} - {address.pincode}</p></div>
    <Link to='/'>Continue Shopping</Link>
  </div>);
}
