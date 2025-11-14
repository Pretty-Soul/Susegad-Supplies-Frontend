import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

export default function BillingPage(){
  const { user, cart, checkout, showToast } = useAppContext();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState(JSON.parse(localStorage.getItem('shippingDetails')) || null);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  useEffect(()=>{
    if(!user || !shipping) navigate('/');
  },[user, shipping, navigate]);

  const subtotal = (cart?.items || []).reduce((s,it)=> s + (Number(it.price||0) * Number(it.quantity||1)), 0);
  const total = subtotal + Number(shipping?.shippingFee || 0 || 0);

  const handlePay = async (e) => {
    e.preventDefault();
    const { ok } = await checkout({ total, address: shipping, paymentMethod });
    if(ok){
      navigate('/order-confirmation');
    }
  };

  if(!shipping) return (<div style={{padding:20}}>No shipping info. Go to checkout.</div>);

  return (<div className='container' style={{padding:20}}>
    <h2>Billing</h2>
    <div>
      <h3>Ship to</h3>
      <p>{shipping.fullName} - {shipping.city}</p>
    </div>
    <div>
      <h3>Items</h3>
      {(cart.items||[]).map(it=> <div key={it.productId}>{it.productName} x {it.quantity} - ₹{(it.price*it.quantity).toFixed(2)}</div>)}
    </div>
    <div style={{marginTop:20}}>
      <strong>Total: ₹{total.toFixed(2)}</strong>
    </div>
    <form onSubmit={handlePay}>
      <div>
        <label><input type='radio' checked={paymentMethod==='Cash on Delivery'} onChange={()=>setPaymentMethod('Cash on Delivery')}/> Cash on Delivery</label>
      </div>
      <div>
        <label><input type='radio' checked={paymentMethod==='Card'} onChange={()=>setPaymentMethod('Card')}/> Card (simulation)</label>
      </div>
      <button type='submit'>Place Order</button>
    </form>
  </div>);
}
