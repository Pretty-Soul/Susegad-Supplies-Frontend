import React, { useState, useEffect, createContext, useContext } from 'react';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

const getApiUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return "http://localhost:5000";
};
const API_URL = getApiUrl();

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('loggedInUser'))||null);
  const [cart, setCart] = useState({ email:null, items: []});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(()=>{ (async ()=>{ try{ const [prod, cats] = await Promise.all([ jsonFetch(API_URL + '/shop/products'), jsonFetch(API_URL + '/shop/categories') ]); setProducts(Array.isArray(prod)?prod:[]); setCategories(Array.isArray(cats)?cats:[]); }catch(err){ console.error(err); } })(); },[]);

  useEffect(()=>{ if(user?.email){ fetchCart(); localStorage.setItem('loggedInUser', JSON.stringify(user)); } else { setCart({ email:null, items: []}); localStorage.removeItem('loggedInUser'); } }, [user]);

  const fetchCart = async ()=> {
    if(!user?.email) return;
    try{
      const data = await jsonFetch(API_URL + '/shop/cart/' + encodeURIComponent(user.email));
      setCart({ email: data?.email || user.email, items: Array.isArray(data?.items)?data.items:[] });
    }catch(err){ console.error("Fetch cart failed:", err); setCart({ email:user.email, items: []}); }
  };

  const addToCart = async ({ productId, quantity=1 })=>{
    if(!user?.email){ showToast("Please login to add items", "error"); return false; }
    try{ await jsonFetch(API_URL + '/shop/cart/add', { method:'POST', body: JSON.stringify({ email: user.email, productId, quantity }) }); await fetchCart(); showToast("Added to cart"); return true; }catch(err){ showToast(err.message||"Failed to add", "error"); return false; }
  };

  const updateCartItem = async ({ productId, quantity })=>{
    if(!user?.email) return false;
    try{ await jsonFetch(API_URL + '/shop/cart/update', { method:'PUT', body: JSON.stringify({ email: user.email, productId, quantity }) }); await fetchCart(); return true; }catch(err){ showToast(err.message||"Failed to update", "error"); return false; }
  };

  const removeFromCart = async (productId)=>{
    if(!user?.email) return false;
    try{ await jsonFetch(API_URL + '/shop/cart/remove/' + encodeURIComponent(user.email) + '/' + encodeURIComponent(productId), { method:'DELETE' }); await fetchCart(); showToast("Removed from cart"); return true; }catch(err){ showToast(err.message||"Failed to remove", "error"); return false; }
  };

  const checkout = async ({ total, address, paymentMethod })=>{
    if(!user?.email){ showToast("Please login to checkout", "error"); return { ok:false }; }
    const items = (cart.items || []).map(item=>({ productId: item.productId, quantity: Number(item.quantity), price: Number(item.price), productName: item.productName }));
    try{
      const data = await jsonFetch(API_URL + '/shop/checkout', { method:'POST', body: JSON.stringify({ items, address, totalAmount: total, userEmail: user.email, paymentMethod }) });
      localStorage.setItem('confirmedOrder', JSON.stringify({ order: data.order, total: data.order?.totalAmount || total, address, paymentMethod }));
      await fetchCart();
      showToast("Order placed!", "success");
      return { ok:true, order: data.order || null };
    }catch(err){
      showToast(err.message || "Checkout failed", "error");
      return { ok:false };
    }
  };

  const showToast = (message, type='success') => {
    const event = new CustomEvent('showtoast', { detail:{ message, type }});
    window.dispatchEvent(event);
  };

  return <AppContext.Provider value={{ API_URL, products, categories, cart, user, setUser, addToCart, updateCartItem, removeFromCart, checkout, fetchCart, showToast }}>{children}</AppContext.Provider>;
};
