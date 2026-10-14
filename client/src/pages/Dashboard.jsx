import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Plus, Link as LinkIcon, Lock, Video, Calendar } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('meetings');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [joinId, setJoinId] = useState('');

  // Handle joining from a pasted link or ID
  const handleJoin = (e) => {
    e.preventDefault();
    if (joinId.trim()) {
      let finalId = joinId.trim();
      if (finalId.includes('invite=')) {
        finalId = new URL(finalId).searchParams.get('invite');
      }
      navigate(`/room?invite=${finalId}`);
    }
  };

  // Generate a random room ID for instant meetings
  const startInstantMeeting = () => {
    const randomId = Math.random().toString(36).substring(2, 14);
    navigate(`/room?invite=${randomId}`);
  };

  // Generate link and open Google Calendar
  const scheduleMeeting = () => {
    const randomId = Math.random().toString(36).substring(2, 14);
    const meetingUrl = `${window.location.origin}/room?invite=${randomId}`;
    
    const title = encodeURIComponent("NetMeet Video Call");
    const details = encodeURIComponent(`Join my secure, end-to-end encrypted video call on NetMeet:\n\n${meetingUrl}`);
    
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(gCalUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0e1017] text-slate-100 font-sans flex flex-col overflow-x-hidden">
      
      {/* HEADER */}
      <header className="p-5 flex justify-between items-center border-b border-slate-800/60 z-10">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-wide">NetMeet</span>
        </div>
        <div>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 cursor-pointer">
                Log in
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center pt-12 sm:pt-20 px-4 w-full">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 text-center tracking-tight">
          Talk in total <span className="text-indigo-400">privacy</span>
        </h1>
        <p className="text-slate-400 mb-10 text-center max-w-md text-sm sm:text-base">
          Protect your conversations with end-to-end encrypted peer-to-peer connections.
        </p>

        {/* TOP ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12 w-full sm:w-auto z-20">
          
          {/* Create Meeting Button with Dropdown */}
          <div className="relative w-full sm:w-auto">
            <button 
              onClick={() => setShowCreateDropdown(!showCreateDropdown)} 
              className={`w-full sm:w-auto border border-slate-700/60 active:scale-95 text-white px-7 py-3.5 rounded-full font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${showCreateDropdown ? 'bg-[#232738]' : 'bg-[#1b1e2a] hover:bg-[#232738]'}`}
            >
              <Plus className="w-5 h-5" />
              <span>Create meeting</span>
            </button>

            {/* Dropdown Menu */}
            {showCreateDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowCreateDropdown(false)}></div>
                <div className="absolute top-full left-0 sm:left-1/2 sm:-translate-x-1/2 mt-3 w-64 bg-[#181a26] border border-slate-800 rounded-2xl shadow-2xl py-2 z-40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={startInstantMeeting}
                    className="text-left px-5 py-3.5 text-sm text-slate-200 hover:bg-[#232738] transition-colors cursor-pointer"
                  >
                    Start an instant meeting
                  </button>
                  <button 
                    onClick={() => {
                      setShowCreateDropdown(false);
                      scheduleMeeting(); // 🔥 Now directly fires the Google Calendar scheduling!
                    }}
                    className="text-left px-5 py-3.5 text-sm text-slate-200 hover:bg-[#232738] transition-colors cursor-pointer"
                  >
                    Schedule a meeting
                  </button>
                  <button 
                    onClick={() => {
                      setShowCreateDropdown(false);
                      setActiveTab('rooms');
                    }}
                    className="text-left px-5 py-3.5 text-sm text-slate-200 hover:bg-[#232738] transition-colors cursor-pointer"
                  >
                    Create a room
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Join with Link Button / Input */}
          {!showJoinInput ? (
            <button 
              onClick={() => setShowJoinInput(true)} 
              className="w-full sm:w-auto bg-[#1b1e2a] hover:bg-[#232738] active:scale-95 text-slate-200 border border-slate-700/60 px-7 py-3.5 rounded-full font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Join with a link</span>
            </button>
          ) : (
            <form onSubmit={handleJoin} className="flex items-center w-full sm:w-auto bg-[#1b1e2a] border border-indigo-500/80 rounded-full px-2 py-1 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] relative z-20">
              <input 
                type="text" 
                placeholder="Paste link or ID..." 
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                autoFocus
                className="bg-transparent text-sm text-slate-200 outline-none px-4 py-2.5 w-48 sm:w-56"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-semibold cursor-pointer">
                Join
              </button>
              <button type="button" onClick={() => setShowJoinInput(false)} className="text-slate-400 hover:text-white px-3 cursor-pointer">
                ✕
              </button>
            </form>
          )}
        </div>

        {/* TABS & CARD AREA */}
        <div className="w-full max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex space-x-8 border-b border-slate-800 pb-3 mb-6 px-4">
            <button 
              onClick={() => setActiveTab('meetings')}
              className={`font-medium text-sm transition-colors relative cursor-pointer ${activeTab === 'meetings' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              My meetings <span className="ml-1 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-bold">0</span>
              {activeTab === 'meetings' && <div className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full"></div>}
            </button>
            
            <button 
              onClick={() => setActiveTab('rooms')}
              className={`font-medium text-sm transition-colors relative cursor-pointer ${activeTab === 'rooms' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              My rooms <span className="ml-1 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-bold">1</span>
              {activeTab === 'rooms' && <div className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full"></div>}
            </button>
          </div>

          {/* Central UI Card */}
          <div className="bg-[#161822] border border-slate-800/80 rounded-[2rem] p-8 sm:p-12 flex flex-col items-center justify-center min-h-[320px] shadow-2xl mx-4 sm:mx-0 relative z-10">
            {activeTab === 'meetings' ? (
              <>
                <div className="w-16 h-16 bg-[#1f2233] border border-slate-700/50 rounded-3xl flex items-center justify-center text-slate-400 mb-6 shadow-inner">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">Schedule a meeting</h3>
                <p className="text-slate-400 text-sm text-center max-w-xs leading-relaxed mb-8">
                  Generate a secure meeting link and instantly add it to your Google Calendar to invite guests.
                </p>
                <button 
                  onClick={scheduleMeeting} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Schedule in Google Calendar
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
                  <Video className="w-7 h-7" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">Your Personal Room</h3>
                <p className="text-slate-400 text-sm text-center max-w-xs leading-relaxed mb-6">
                  Your persistent, reusable private meeting space.
                </p>
                <button onClick={() => navigate('/room')} className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer">
                  Enter Room &rarr;
                </button>
              </>
            )}
          </div>

          {/* Bottom Authentication Prompt (Only visible if logged out) */}
          <SignedOut>
            <div className="mt-8 mx-4 sm:mx-0 bg-[#23253b] border border-[#3b3e5c] rounded-2xl p-5 flex items-center justify-center text-sm shadow-xl relative z-10">
              <Lock className="w-4 h-4 text-indigo-300 mr-2.5 shrink-0" />
              <span className="text-indigo-200">
                <SignInButton mode="modal">
                  <button className="font-bold text-white hover:text-indigo-100 underline decoration-indigo-400/50 underline-offset-4 cursor-pointer transition-colors">
                    Create an account
                  </button>
                </SignInButton>
                {' '}or{' '}
                <SignInButton mode="modal">
                  <button className="font-bold text-white hover:text-indigo-100 underline decoration-indigo-400/50 underline-offset-4 cursor-pointer transition-colors">
                    Sign in
                  </button>
                </SignInButton>
                {' '}to schedule meetings
              </span>
            </div>
          </SignedOut>
        </div>
      </main>
    </div>
  );
}