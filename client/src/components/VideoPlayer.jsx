import React, { useContext, useState, useEffect, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { 
  Video, VideoOff, Mic, MicOff, Share2, PhoneOff, 
  User, PhoneIncoming, Copy, Check, MessageSquare, Send, Globe, X 
} from 'lucide-react';

const VideoPlayer = () => {
  const context = useContext(SocketContext);
  const navigate = useNavigate();
  
  const params = new URLSearchParams(window.location.search);
  const inviteId = params.get('invite');
  
  const [idToCall, setIdToCall] = useState(inviteId || '');
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  const ringtoneAudio = useRef(null);
  
  if (!context) return <div className="fixed inset-0 bg-[#0e1017] flex items-center justify-center text-white z-50">Securing connection...</div>;

  const { 
    myVideo, userVideo, stream, remoteStream, user, me, isConnected,
    call, callAccepted, callEnded, isCalling, callUser, answerCall, leaveCall,
    toggleAudio, toggleVideo, shareScreen, isAudioMuted, isVideoOff,
    cameraError,
    messages, sendMessage, persistentRoomId 
  } = context;

  const callActive = callAccepted && !callEnded;

  // Auto-dial logic for persistent invite links
  useEffect(() => {
    if (inviteId && isConnected && !callAccepted && !isCalling && !call.isReceivedCall) {
      console.log("Auto-dialing host from persistent invite link:", inviteId);
      callUser(inviteId);
    }
  }, [inviteId, isConnected, callAccepted, isCalling, call.isReceivedCall, callUser]);

  // Ringtone initialization and control
  useEffect(() => {
    ringtoneAudio.current = new Audio('/ringtone.mp3');
    ringtoneAudio.current.loop = true;
  }, []);

  useEffect(() => {
    if (call.isReceivedCall && !callAccepted && !callEnded) {
      ringtoneAudio.current?.play().catch(err => console.log("Browser blocked autoplay:", err));
    } else {
      if (ringtoneAudio.current) {
        ringtoneAudio.current.pause();
        ringtoneAudio.current.currentTime = 0; 
      }
    }
  }, [call.isReceivedCall, callAccepted, callEnded]);

  // Bind local video stream cleanly
  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream, cameraError, myVideo]);

  // Bind remote video stream & force play for mobile WebRTC compliance
  useEffect(() => {
    if (userVideo.current && remoteStream) {
      userVideo.current.srcObject = remoteStream;
      userVideo.current.play().catch(err => console.log("Remote video play error:", err));
    }
  }, [remoteStream, callActive, userVideo]);

  const copyInviteLink = () => {
    if (!persistentRoomId) return alert("Still connecting to the server. Please wait.");
    const inviteLink = `${window.location.origin}/room?invite=${persistentRoomId}`; 
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessage(message.trim());
    setMessage('');
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#0e1017] text-slate-100 font-sans flex z-[100] overflow-hidden">
      
      {/* 📞 INCOMING CALL OVERLAY */}
      {call.isReceivedCall && !callAccepted && !callEnded && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[200] bg-indigo-600 text-white px-6 py-4 rounded-full shadow-[0_10px_40px_-10px_rgba(79,70,229,0.8)] flex items-center space-x-6 border border-indigo-400/30 animate-bounce">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full"><PhoneIncoming className="w-5 h-5" /></div>
            <span className="font-semibold">{call.name || 'Guest'} is calling...</span>
          </div>
          <button onClick={answerCall} className="bg-white text-indigo-600 hover:bg-slate-100 active:scale-95 px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-all cursor-pointer">
            Answer
          </button>
        </div>
      )}

      {/* MAIN VIDEO DISPLAY AREA */}
      <div className="relative flex-1 h-full bg-[#0a0c10] overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="absolute top-0 left-0 right-0 z-40 px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between pointer-events-none">
          <div className="flex items-center space-x-3 pointer-events-auto">
            <div className="bg-indigo-600/80 backdrop-blur-sm p-2 rounded-xl">
              <Globe className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-white drop-shadow-md">NetMeet Live</h1>
              <p className="text-[10px] text-emerald-400 flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                <span className="drop-shadow-md">{isConnected ? 'Encrypted P2P' : 'Connecting...'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 pointer-events-auto">
             <button onClick={copyInviteLink} className="flex items-center space-x-2 bg-black/40 hover:bg-black/60 active:scale-95 backdrop-blur-md text-white px-3 sm:px-4 py-2 rounded-full text-xs font-medium transition-all border border-white/10 cursor-pointer">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
             <button onClick={() => navigate('/')} className="bg-red-500/20 hover:bg-red-500/40 active:scale-95 backdrop-blur-md text-red-100 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold transition-all border border-red-500/30 cursor-pointer">
              Leave
            </button>
          </div>
        </header>

        {/* FULL SCREEN REMOTE VIDEO */}
        {callActive ? (
          <video 
            playsInline 
            ref={userVideo} 
            autoPlay 
            onLoadedMetadata={(e) => e.target.play().catch(err => console.log(err))} 
            className="absolute inset-0 w-full h-full object-cover z-0" 
          />
        ) : (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-center p-6 bg-[#0a0c10]">
            <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-400 mb-6 shadow-inner">
              <User className="w-10 h-10" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">Ready to connect</h3>
            <p className="text-sm text-slate-400 mb-8 max-w-sm">Share your reusable invite link with a guest, or paste their ID below to start the call.</p>
            
            <div className="flex items-center bg-[#14161f] border border-slate-700/80 rounded-full p-1.5 w-full max-w-md shadow-2xl">
              <input 
                type="text" 
                placeholder="Paste ID here..." 
                value={idToCall}
                onChange={(e) => setIdToCall(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-200 text-sm px-4 flex-1 w-full"
              />
              <button onClick={() => callUser(idToCall)} className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer">
                Call
              </button>
            </div>
          </div>
        )}

        {/* LOCAL VIDEO PiP */}
        <div className="absolute bottom-24 right-4 md:bottom-28 md:right-8 w-28 md:w-44 aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-2 border-slate-700/80 z-30 flex items-center justify-center group">
          <div className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
            <span className="text-[10px] font-medium text-white">You</span>
          </div>
          {stream && !cameraError ? (
            <video 
              playsInline 
              muted 
              ref={myVideo} 
              autoPlay 
              onLoadedMetadata={(e) => e.target.play().catch(err => console.log(err))} 
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${isVideoOff ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 z-0`} 
            />
          ) : (
             <VideoOff className="w-6 h-6 text-red-400 z-10" />
          )}
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
              <VideoOff className="w-6 h-6 text-slate-500" />
            </div>
          )}
        </div>

        {/* BOTTOM CONTROL DOCK */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center space-x-2 sm:space-x-3 bg-black/70 backdrop-blur-xl px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/10 shadow-2xl max-w-[92vw]">
          <button onClick={toggleAudio} className={`flex items-center justify-center p-3 sm:p-3.5 rounded-full transition-all active:scale-90 cursor-pointer ${!isAudioMuted ? 'bg-slate-700/80 hover:bg-slate-600 text-white' : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}>
            {!isAudioMuted ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button onClick={toggleVideo} className={`flex items-center justify-center p-3 sm:p-3.5 rounded-full transition-all active:scale-90 cursor-pointer ${!isVideoOff ? 'bg-slate-700/80 hover:bg-slate-600 text-white' : 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}>
            {!isVideoOff ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button onClick={shareScreen} className="hidden sm:flex items-center justify-center p-3 sm:p-3.5 rounded-full transition-all active:scale-90 cursor-pointer bg-slate-700/80 hover:bg-slate-600 text-white">
            <Share2 className="w-5 h-5" />
          </button>

          {/* MOBILE CHAT TOGGLE BUTTON */}
          <button 
            onClick={() => setShowMobileChat(!showMobileChat)} 
            className={`flex lg:hidden items-center justify-center p-3 sm:p-3.5 rounded-full transition-all active:scale-90 cursor-pointer ${showMobileChat ? 'bg-indigo-600 text-white' : 'bg-slate-700/80 text-white'}`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {callActive && (
            <>
              <div className="h-6 w-px bg-white/20 mx-1 sm:mx-2"></div>
              <button onClick={leaveCall} className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center space-x-2 cursor-pointer">
                <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">End Call</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR CHAT (DESKTOP & MOBILE OVERLAY) */}
      <div className={`
        bg-[#11131a] border-l border-slate-800/80 flex-col h-full z-[300] lg:z-40 shadow-2xl transition-all duration-300
        ${showMobileChat ? 'fixed inset-0 w-full flex' : 'hidden lg:flex w-80 md:w-96'}
      `}>
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-[#14161f]">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">Room Chat</span>
          </div>
          <button 
            onClick={() => setShowMobileChat(false)} 
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/40 flex items-center justify-center mb-3 text-xl">👋</div>
              <p className="text-xs">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`p-3 rounded-2xl border border-slate-700/50 max-w-[85%] ${msg.sender === 'You' ? 'bg-indigo-600/40 self-end text-right border-indigo-500/30' : 'bg-slate-800/60 self-start'}`}>
                <p className="text-[10px] font-bold text-indigo-400 mb-1">{msg.sender}</p>
                <p className="text-xs text-slate-200 leading-relaxed break-words">{msg.text}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800/80 bg-[#14161f] flex items-center space-x-2">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 bg-slate-900/80 border border-slate-700/50 rounded-full px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 active:scale-90 p-2.5 rounded-full text-white transition-all shadow-md cursor-pointer">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};

export default VideoPlayer;