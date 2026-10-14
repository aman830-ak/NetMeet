import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Star, X, Video } from 'lucide-react';

export default function YouLeft() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (star) => {
    setRating(star);
    setSubmitted(true);
    
    // Automatically redirect back to the main dashboard after submitting the review
    setTimeout(() => {
      navigate('/dashboard'); 
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0e1017] text-slate-100 flex flex-col items-center justify-between p-6 font-sans">
      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-wide">NetMeet</span>
        </div>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="text-slate-400 hover:text-white p-2 rounded-full cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md flex flex-col items-center text-center my-auto py-8">
        <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-xl">
          <LogOut className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-8">You left the meeting</h1>

        {/* Call Quality Rating Card */}
        <div className="w-full bg-[#141722] border border-slate-800 rounded-2xl p-6 mt-4 shadow-2xl h-[140px] flex flex-col justify-center transition-all duration-300">
          {submitted ? (
            <div className="animate-pulse">
              <h3 className="text-lg font-bold text-emerald-400 mb-2">Thank you!</h3>
              <p className="text-sm text-slate-400">Taking you back to the main page...</p>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-white mb-4">How was the call quality?</h3>
              <div className="flex justify-center items-center space-x-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="cursor-pointer transition-transform hover:scale-110 active:scale-90"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-[11px] text-slate-600">NetMeet Encrypted P2P</div>
    </div>
  );
}