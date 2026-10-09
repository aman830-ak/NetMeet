// src/pages/ThankYou.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-[#0e1017] text-slate-200 flex flex-col items-center justify-center p-6 text-center">
      <CheckCircle className="w-16 h-16 text-emerald-500 mb-6" />
      <h1 className="text-3xl font-bold text-white mb-4">Message Received!</h1>
      <p className="text-slate-400 max-w-md mb-8">
        Thank you for reaching out. We have securely received your message and will get back to you shortly.
      </p>
      <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold transition-all">
        Return Home
      </Link>
    </div>
  );
}