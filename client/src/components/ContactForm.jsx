// src/components/ContactForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ContactForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', message: '', bot_field: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Client-side honeypot check (Optional early exit)
    if (formData.bot_field) return; 

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) navigate('/thank-you');
    } catch (err) {
      console.error("Submission failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 max-w-md mx-auto p-6">
      <input 
        type="text" 
        placeholder="Name" 
        required 
        onChange={e => setFormData({...formData, name: e.target.value})} 
        className="px-4 py-2 bg-slate-800 text-white rounded-lg"
      />
      <input 
        type="email" 
        placeholder="Email" 
        required 
        onChange={e => setFormData({...formData, email: e.target.value})} 
        className="px-4 py-2 bg-slate-800 text-white rounded-lg"
      />
      
      {/* 🍯 Hidden Honeypot Field */}
      <div aria-hidden="true" className="absolute opacity-0 -z-50 pointer-events-none">
        <label htmlFor="bot_field">Don't fill this out if you're human:</label>
        <input 
          type="text" 
          id="bot_field" 
          name="bot_field" 
          tabIndex="-1" 
          autoComplete="off"
          onChange={e => setFormData({...formData, bot_field: e.target.value})}
        />
      </div>

      <textarea 
        placeholder="Message" 
        required 
        onChange={e => setFormData({...formData, message: e.target.value})}
        className="px-4 py-2 bg-slate-800 text-white rounded-lg min-h-[100px]"
      />
      <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold">Send</button>
    </form>
  );
}