import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

export default function CartSidebar({ open, onClose }){
  const { cart, user, updateCartItem, removeFromCart } = useAppContext();
  const navigate = useNavigate();
  if(!open) return null;
  const items = (cart.items || []).map(it=>({ ...it, price: Number(it.price||0), quantity: Number(it.quantity||1) }));
  const subtotal = items.reduce((s,i)=> s + i.price*i.quantity, 0);
  const handleQty = async (id, qty) => {
    if(qty<1) await removeFromCart(id); else await updateCartItem({ productId:id, quantity:qty });
  };
  return (<div className='cart-overlay' onClick={onClose}>
    <div className='cart-sidebar' onClick={e=>e.stopPropagation()}>
      <h3>Your Cart</h3>
      {items.length===0 ? <div>No items</div> : items.map(it=> <div key={it.productId}><div>{it.productName}</div><div>₹{(it.price*it.quantity).toFixed(2)}</div><div><button onClick={()=>handleQty(it.productId, it.quantity-1)}>-</button><span>{it.quantity}</span><button onClick={()=>handleQty(it.productId, it.quantity+1)}>+</button></div></div>)}
      <div><strong>Subtotal: ₹{subtotal.toFixed(2)}</strong></div>
      <button onClick={()=>{ onClose(); navigate('/checkout'); }}>Proceed to Checkout</button>
      <Link to='/products'>Continue Shopping</Link>
    </div>
  </div>);
}
